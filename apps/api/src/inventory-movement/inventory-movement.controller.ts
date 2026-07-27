import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Permission } from '@repo/shared';
import { AuthContext } from 'src/auth/auth.types';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Company, type CompanyContext } from 'src/common/company';
import { RequirePermissions } from 'src/common/permissions';

import { CreateInventoryAdjustmentDto } from './dto/create-inventory-adjustment.dto';
import { CreateWasteDto } from './dto/create-waste.dto';
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

  @RequirePermissions(Permission.INVENTORY_ADJUST)
  @Post('adjustments')
  createAdjustment(
    @Company() company: CompanyContext,
    @Auth() auth: AuthContext,
    @Body() dto: CreateInventoryAdjustmentDto,
  ) {
    return this.inventoryMovementService.createAdjustment(
      company,
      auth.userId,
      dto,
    );
  }

  @RequirePermissions(Permission.INVENTORY_READ)
  @Get('waste/alerts')
  getRecurringWasteAlerts(
    @Company() company: CompanyContext,
    @Query('branchId') branchId?: string,
  ) {
    return this.inventoryMovementService.getRecurringWasteAlerts(
      company,
      branchId,
    );
  }

  @RequirePermissions(Permission.INVENTORY_ADJUST)
  @Post('waste')
  createWaste(
    @Company() company: CompanyContext,
    @Auth() auth: AuthContext,
    @Body() createWasteDto: CreateWasteDto,
  ) {
    return this.inventoryMovementService.createWaste(
      company,
      auth.userId,
      createWasteDto,
    );
  }
}
