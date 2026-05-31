import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CompanyId, RequireCompany } from 'src/common/company';

import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { QueryCategoriesDto } from './dto/query-categories.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @RequireCompany()
  @Get()
  findAll(
    @CompanyId() companyId: string,
    @Query() query: QueryCategoriesDto,
  ) {
    return this.categoriesService.findPaginatedByCompany(companyId, query);
  }

  @RequireCompany()
  @Get('all')
  findAllActive(@CompanyId() companyId: string) {
    return this.categoriesService.findAllByCompany(companyId);
  }

  @RequireCompany()
  @Get(':id')
  findById(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.categoriesService.findByIdInCompany(id, companyId);
  }

  @RequireCompany()
  @Post()
  create(
    @Body() dto: CreateCategoryDto,
    @CompanyId() companyId: string,
  ) {
    return this.categoriesService.create(companyId, dto);
  }

  @RequireCompany()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @CompanyId() companyId: string,
  ) {
    return this.categoriesService.update(id, companyId, dto);
  }

  @RequireCompany()
  @Patch(':id/activate')
  activate(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.categoriesService.activate(id, companyId);
  }

  @RequireCompany()
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.categoriesService.deactivate(id, companyId);
  }

  @RequireCompany()
  @Delete(':id')
  remove(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.categoriesService.remove(id, companyId);
  }
}
