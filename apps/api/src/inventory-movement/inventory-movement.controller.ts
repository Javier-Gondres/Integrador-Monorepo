import { Controller, Get, Query } from '@nestjs/common';
import { Permission } from '@repo/shared';
import { Company, type CompanyContext } from 'src/common/company';
import { RequirePermissions } from 'src/common/permissions';

import { QueryInventoryMovementDto } from './dto/query-inventory-movement.dto';
import { InventoryMovementService } from './inventory-movement.service';

@Controller('inventory-movements')
export class InventoryMovementController {
  constructor(
    private readonly inventoryMovementService: InventoryMovementService,
  ) {}

  @RequirePermissions(Permission.INVENTORY_READ)
  @Get()
  findAll(
    @Company() company: CompanyContext,
    @Query() query: QueryInventoryMovementDto,
  ) {
    return this.inventoryMovementService.findAllByBranch(company, query);
  }
}
