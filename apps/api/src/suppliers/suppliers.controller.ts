import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { SuppliersService } from './suppliers.service';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  findAll() {
    return this.suppliersService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ) {
    if (!id?.trim()) {
      throw new BadRequestException('Supplier id is required');
    }

    return this.suppliersService.findOne(id);
  }

  @Post()
  create(
    @Body()
    body: {
      supplierId?: unknown;
      name?: unknown;
      email?: unknown;
      rnc?: unknown;
      phoneNumber?: unknown;
      address?: unknown;
      companyId?: unknown;
    },
  ) {
    const supplierId =
      typeof body.supplierId === 'string' ? body.supplierId.trim() : '';

    const name = typeof body.name === 'string' ? body.name.trim() : '';

    const email = typeof body.email === 'string' ? body.email.trim() : '';

    const rnc = typeof body.rnc === 'string' ? body.rnc.trim() : '';

    const phoneNumber =
      typeof body.phoneNumber === 'string' ? body.phoneNumber.trim() : '';

    const address = typeof body.address === 'string' ? body.address.trim() : '';
    const companyId =
      typeof body.companyId === 'string' ? body.companyId.trim() : '';

    if (!supplierId) {
      throw new BadRequestException('Supplier ID is required');
    }

    if (!name) {
      throw new BadRequestException('Name is required');
    }

    if (!email) {
      throw new BadRequestException('Email is required');
    }

    if (!rnc) {
      throw new BadRequestException('RNC is required');
    }

    if (!phoneNumber) {
      throw new BadRequestException('Phone number is required');
    }

    if (!address) {
      throw new BadRequestException('Address is required');
    }

    if (!companyId) {
      throw new BadRequestException('Company id is required');
    }

    return this.suppliersService.create(
      supplierId,
      name,
      email,
      rnc,
      phoneNumber,
      address,
      companyId,
    );
  }

  @Patch(':id')
  update(
    @Param('id')
    id: string,

    @Body()
    body: {
      supplierId?: unknown;
      name?: unknown;
      email?: unknown;
      rnc?: unknown;
      phoneNumber?: unknown;
      address?: unknown;
      companyId?: unknown;
    },
  ) {
    if (!id?.trim()) {
      throw new BadRequestException('Supplier id is required');
    }

    const supplierId =
      typeof body.supplierId === 'string'
        ? body.supplierId.trim() || undefined
        : undefined;

    const name =
      typeof body.name === 'string' ? body.name.trim() || undefined : undefined;

    const email =
      typeof body.email === 'string'
        ? body.email.trim() || undefined
        : undefined;

    const rnc =
      typeof body.rnc === 'string' ? body.rnc.trim() || undefined : undefined;

    const phoneNumber =
      typeof body.phoneNumber === 'string'
        ? body.phoneNumber.trim() || undefined
        : undefined;

    const address =
      typeof body.address === 'string'
        ? body.address.trim() || undefined
        : undefined;

    const companyId =
      typeof body.companyId === 'string'
        ? body.companyId.trim() || undefined
        : undefined;

    return this.suppliersService.update(id, {
      supplierId,
      name,
      email,
      rnc,
      phoneNumber,
      address,
      companyId,
    });
  }

  @Delete(':id')
  remove(
    @Param('id')
    id: string,
  ) {
    if (!id?.trim()) {
      throw new BadRequestException('Supplier id is required');
    }

    return this.suppliersService.remove(id);
  }
}
