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
import { CompanyId } from 'src/common/company';
import { RequirePermissions } from 'src/common/permissions';

import { CreateTransferDto } from './dto/create-transfer.dto';
import { QueryTransfersDto } from './dto/query-transfers.dto';
import { TransfersService } from './transfers.service';

@Controller('transfers')
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @RequirePermissions(Permission.INVENTORY_TRANSFER)
  @Post()
  create(
    @Body() createTransferDto: CreateTransferDto,
    @CompanyId() companyId: string,
  ) {
    return this.transfersService.create(companyId, createTransferDto);
  }

  @RequirePermissions(Permission.INVENTORY_READ)
  @Get()
  findAll(@CompanyId() companyId: string, @Query() query: QueryTransfersDto) {
    return this.transfersService.findAll(companyId, query);
  }

  @RequirePermissions(Permission.INVENTORY_READ)
  @Get('stock')
  getStock(
    @Query('branchId') branchId: string,
    @Query('productId') productId: string,
    @CompanyId() companyId: string,
  ) {
    return this.transfersService.getStock(branchId, productId, companyId);
  }

  @RequirePermissions(Permission.INVENTORY_TRANSFER)
  @Patch(':id/dispatch')
  dispatch(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.transfersService.dispatch(id, companyId);
  }

  @RequirePermissions(Permission.INVENTORY_TRANSFER)
  @Patch(':id/complete')
  complete(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.transfersService.complete(id, companyId);
  }

  @RequirePermissions(Permission.INVENTORY_TRANSFER)
  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.transfersService.cancel(id, companyId);
  }
}
