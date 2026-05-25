import {
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(
    @Query('page') page = '1',
    @Query('take') take = '10',
    @Query('q') q = '',
  ) {
    return this.categoriesService.findPaginated({
      page: Math.max(1, Number(page)),
      take: Math.min(50, Math.max(1, Number(take))),
      q: q.trim(),
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  create(
    @Body() body: { name: string; description?: string; state?: boolean },
  ) {
    return this.categoriesService.create(body.name, body.description);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name?: string; description?: string; state?: boolean },
  ) {
    return this.categoriesService.update(id, body);
  }

  @Patch(':id/state/:state')
  changeState(
    @Param('id', ParseIntPipe) id: number,
    @Param('state', ParseBoolPipe) state: boolean,
  ) {
    return this.categoriesService.changeState(id, state);
  }

  @Patch(':id/delete')
  softDelete(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.softDelete(id);
  }
}
