import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Permission } from '@repo/shared';
import { AuthContext } from 'src/auth/auth.types';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Company, type CompanyContext, CompanyId } from 'src/common/company';
import { RequirePermissions } from 'src/common/permissions';

import { CreateInventoryDto } from './dto/create-inventory.dto';
import { QueryInventoryDto } from './dto/query-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InventoryService } from './inventory.service';

@Controller('inventories')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @RequirePermissions(Permission.INVENTORY_ADJUST)
  @Post()
  create(
    @Body() createInventoryDto: CreateInventoryDto,
    @CompanyId() companyId: string,
    @Auth() auth: AuthContext,
  ) {
    return this.inventoryService.create(
      createInventoryDto,
      companyId,
      auth.userId,
    );
  }

  @RequirePermissions(Permission.INVENTORY_READ)
  @Get()
  findAll(
    @Company() company: CompanyContext,
    @Query() query: QueryInventoryDto,
  ) {
    return this.inventoryService.findAllByBranch(company, query);
  }

  @RequirePermissions(Permission.INVENTORY_READ)
  @Get(':id')
  findById(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.inventoryService.findById(id, companyId);
  }

  @RequirePermissions(Permission.INVENTORY_ADJUST)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CompanyId() companyId: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.inventoryService.update(id, companyId, updateInventoryDto);
  }

  @RequirePermissions(Permission.INVENTORY_ADJUST)
  @Patch(':id/activate')
  activate(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.inventoryService.activate(id, companyId);
  }

  @RequirePermissions(Permission.INVENTORY_ADJUST)
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.inventoryService.deactivate(id, companyId);
  }
}
