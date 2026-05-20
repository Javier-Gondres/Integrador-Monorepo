import {
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  create(
    @Body()
    body: {
      name: string;
      description?: string;
    },
  ) {
    return this.categoriesService.create(body.name, body.description);
  }

  @Patch(':id/state/:state')
  changeState(
    @Param('id', ParseIntPipe) id: number,

    @Param('state', ParseBoolPipe)
    state: boolean,
  ) {
    return this.categoriesService.changeState(id, state);
  }
}
