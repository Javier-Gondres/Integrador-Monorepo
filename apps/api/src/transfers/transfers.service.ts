import { Injectable } from '@nestjs/common';
import { InventoryMovementType, prisma, TransferStatus } from '@repo/db';
import { BranchAccessService } from 'src/branch/branch-access.service';
import { BusinessException, ErrorCodes } from 'src/common/errors';
import { ProductsRepository } from 'src/products/products.repository';

import { CreateTransferDto } from './dto/create-transfer.dto';
import {
  NormalizedQueryTransfers,
  QueryTransfersDto,
} from './dto/query-transfers.dto';
import { TransfersRepository } from './transfers.repository';
import type { TransferRecord } from './transfers.selects';

const DEFAULT_PAGE = 1;
const DEFAULT_TAKE = 10;

@Injectable()
export class TransfersService {
  constructor(
    private readonly transfersRepository: TransfersRepository,
    private readonly branchAccessService: BranchAccessService,
    private readonly productsRepository: ProductsRepository,
  ) {}

  async create(companyId: string, dto: CreateTransferDto) {
    if (dto.fromBranchId === dto.toBranchId) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'La sucursal de origen y destino no pueden ser la misma',
      );
    }

    await Promise.all([
      this.branchAccessService.assertBranchInCompany(
        dto.fromBranchId,
        companyId,
      ),
      this.branchAccessService.assertBranchInCompany(dto.toBranchId, companyId),
    ]);

    for (const item of dto.items) {
      const product = await this.productsRepository.findByIdInCompany(
        item.productId,
        companyId,
      );
      if (!product) {
        throw new BusinessException(
          ErrorCodes.PRODUCT_NOT_FOUND,
          `El producto con ID ${item.productId} no existe`,
        );
      }
    }

    return this.transfersRepository.create(
      dto.fromBranchId,
      dto.toBranchId,
      dto.notes,
      dto.items,
    );
  }

  async dispatch(id: string, companyId: string) {
    const transfer = await this.requireTransferInCompany(id, companyId);

    if (transfer.status !== TransferStatus.PENDING) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'Solo se pueden despachar transferencias en estado pendiente',
      );
    }

    for (const item of transfer.items) {
      const stock = await this.transfersRepository.getStockForProduct(
        transfer.fromBranchId,
        item.product.id,
      );
      if (stock < Number(item.quantity)) {
        throw new BusinessException(
          ErrorCodes.INSUFFICIENT_STOCK,
          `Stock insuficiente para el producto ${item.product.name}`,
        );
      }
    }

    return this.transfersRepository.updateStatus(id, TransferStatus.IN_TRANSIT);
  }

  async complete(id: string, companyId: string) {
    const transfer = await this.requireTransferInCompany(id, companyId);

    if (transfer.status !== TransferStatus.IN_TRANSIT) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'Solo se pueden completar transferencias en tránsito',
      );
    }

    await prisma.$transaction(async (tx) => {
      const current = await tx.transfer.findFirst({
        where: {
          id,
          status: TransferStatus.IN_TRANSIT,
          fromBranch: { companyId },
          toBranch: { companyId },
        },
        select: { id: true },
      });

      if (!current) {
        throw new BusinessException(
          ErrorCodes.RECORD_NOT_FOUND,
          'Transferencia no encontrada',
        );
      }

      for (const item of transfer.items) {
        const qty = item.quantity;
        const decrementResult = await tx.inventory.updateMany({
          where: {
            branchId: transfer.fromBranchId,
            productId: item.product.id,
            quantity: { gte: qty },
          },
          data: { quantity: { decrement: qty } },
        });

        if (decrementResult.count === 0) {
          throw new BusinessException(
            ErrorCodes.INSUFFICIENT_STOCK,
            `Stock insuficiente para el producto ${item.product.name}`,
          );
        }

        await tx.inventoryMovement.create({
          data: {
            branchId: transfer.fromBranchId,
            productId: item.product.id,
            type: InventoryMovementType.TRANSFER_OUT,
            quantity: qty,
            transferId: transfer.id,
          },
        });

        await tx.inventory.upsert({
          where: {
            branchId_productId: {
              branchId: transfer.toBranchId,
              productId: item.product.id,
            },
          },
          update: { quantity: { increment: qty } },
          create: {
            branchId: transfer.toBranchId,
            productId: item.product.id,
            quantity: qty,
          },
        });

        await tx.inventoryMovement.create({
          data: {
            branchId: transfer.toBranchId,
            productId: item.product.id,
            type: InventoryMovementType.TRANSFER_IN,
            quantity: qty,
            transferId: transfer.id,
          },
        });
      }

      await tx.transfer.update({
        where: { id },
        data: { status: TransferStatus.COMPLETED },
      });
    });

    return this.transfersRepository.findByIdInCompany(id, companyId);
  }

  async cancel(id: string, companyId: string) {
    const transfer = await this.requireTransferInCompany(id, companyId);

    if (
      transfer.status === TransferStatus.COMPLETED ||
      transfer.status === TransferStatus.CANCELLED
    ) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        `No se puede cancelar una transferencia en estado ${transfer.status}`,
      );
    }

    return this.transfersRepository.updateStatus(id, TransferStatus.CANCELLED);
  }

  async findAll(companyId: string, query: QueryTransfersDto) {
    const normalized = this.normalizeQuery(query);
    const { items, total } =
      await this.transfersRepository.findPaginatedByCompany(
        companyId,
        normalized,
      );

    return {
      items,
      meta: {
        page: normalized.page,
        take: normalized.take,
        total,
        totalPages: Math.ceil(total / normalized.take) || 0,
      },
    };
  }

  async getStock(branchId: string, productId: string, companyId: string) {
    await this.branchAccessService.assertBranchInCompany(branchId, companyId);

    const product = await this.productsRepository.findByIdInCompany(
      productId,
      companyId,
    );
    if (!product) {
      throw BusinessException.notFound(
        ErrorCodes.PRODUCT_NOT_FOUND,
        'Producto no encontrado',
      );
    }

    const quantity = await this.transfersRepository.getStockForProduct(
      branchId,
      productId,
    );
    return { quantity };
  }

  private async requireTransferInCompany(
    id: string,
    companyId: string,
  ): Promise<TransferRecord> {
    const transfer = await this.transfersRepository.findByIdInCompany(
      id,
      companyId,
    );

    if (!transfer) {
      throw new BusinessException(
        ErrorCodes.RECORD_NOT_FOUND,
        'Transferencia no encontrada',
      );
    }

    return transfer;
  }

  private normalizeQuery(query: QueryTransfersDto): NormalizedQueryTransfers {
    return {
      page: query.page ?? DEFAULT_PAGE,
      take: query.take ?? DEFAULT_TAKE,
      ...(query.search?.trim() && { search: query.search.trim() }),
      ...(query.status && { status: query.status }),
    };
  }
}
