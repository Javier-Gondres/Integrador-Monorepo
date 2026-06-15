import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CompanyId, RequireCompany } from 'src/common/company';

import { CreateTransferDto } from './dto/create-transfer.dto';
import { QueryTransfersDto } from './dto/query-transfers.dto';
import { TransfersService } from './transfers.service';

@Controller('transfers')
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @RequireCompany()
  @Post()
  create(
    @Body() createTransferDto: CreateTransferDto,
    @CompanyId() companyId: string,
  ) {
    return this.transfersService.create(companyId, createTransferDto);
  }

  @RequireCompany()
  @Get()
  findAll(@CompanyId() companyId: string, @Query() query: QueryTransfersDto) {
    return this.transfersService.findAll(companyId, query);
  }

  @RequireCompany()
  @Get('stock')
  getStock(
    @Query('branchId') branchId: string,
    @Query('productId') productId: string,
  ) {
    return this.transfersService.getStock(branchId, productId);
  }

  @RequireCompany()
  @Patch(':id/dispatch')
  dispatch(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.transfersService.dispatch(id, companyId);
  }

  @RequireCompany()
  @Patch(':id/complete')
  complete(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.transfersService.complete(id, companyId);
  }

  @RequireCompany()
  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.transfersService.cancel(id, companyId);
  }
}
