import type { PaginatedResponse } from "@/types/pagination";

import type { TransferDto, Transferencia } from "../types/transferencia.types";

export function mapTransferDtoToUi(dto: TransferDto): Transferencia {
  return {
    id: dto.id,
    origenNombre: dto.fromBranch.name,
    origenDireccion: dto.fromBranch.address,
    destinoNombre: dto.toBranch.name,
    destinoDireccion: dto.toBranch.address,
    estado: dto.status,
    notas: dto.notes,
    creadaEn: dto.createdAt,
    items: dto.items.map((item) => ({
      id: item.id,
      cantidad: Number(item.quantity),
      productoId: item.product.id,
      productoNombre: item.product.name,
      productoSku: item.product.code,
    })),
  };
}

export function mapTransfersPageToUi(
  page: PaginatedResponse<TransferDto>,
): PaginatedResponse<Transferencia> {
  return {
    ...page,
    items: page.items.map(mapTransferDtoToUi),
  };
}
