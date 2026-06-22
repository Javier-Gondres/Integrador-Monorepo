import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  Company,
  type CompanyContext,
  RequireCompany,
} from 'src/common/company';

import { QueryInventoryMovementDto } from './dto/query-inventory-movement.dto';
import { CreateWasteDto } from './dto/create-waste.dto';
import { InventoryMovementService } from './inventory-movement.service';

@Controller('inventory-movements')
export class InventoryMovementController {
  constructor(
    private readonly inventoryMovementService: InventoryMovementService,
  ) {}

  @RequireCompany()
  @Get()
  findAll(
    @Company() company: CompanyContext,
    @Query() query: QueryInventoryMovementDto,
  ) {
    return this.inventoryMovementService.findAllByBranch(company, query);
  }

  @RequireCompany()
  @Post('waste')
  createWaste(
    @Company() company: CompanyContext,
    @Body() createWasteDto: CreateWasteDto,
  ) {
    return this.inventoryMovementService.createWaste(company, createWasteDto);
  }
}
