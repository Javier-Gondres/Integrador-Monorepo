import {
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { ProductsService } from './products.service.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(
    @Query('page') page = '1',
    @Query('take') take = '10',
    @Query('q') q = '',
  ) {
    return this.productsService.findPaginated({
      page: Math.max(1, Number(page)),
      take: Math.min(50, Math.max(1, Number(take))),
      q: q.trim(),
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  create(
    @Body()
    body: {
      name: string;
      description?: string;
      price: number;
      companyId?: string | null;
      state?: boolean;
    },
  ) {
    return this.productsService.create(body);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      description?: string;
      price?: number;
      companyId?: string | null;
      state?: boolean;
    },
  ) {
    return this.productsService.update(id, body);
  }

  @Patch(':id/state/:state')
  changeState(
    @Param('id') id: string,
    @Param('state', ParseBoolPipe) state: boolean,
  ) {
    return this.productsService.changeState(id, state);
  }

  @Patch(':id/delete')
  softDelete(@Param('id') id: string) {
    return this.productsService.softDelete(id);
  }
}