import { Permission } from '@repo/shared';
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
import { CompanyId } from 'src/common/company';
import { RequirePermissions } from 'src/common/permissions';

import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { QueryCategoriesDto } from './dto/query-categories.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

/** Catálogo company-wide: no depende del estado de la sucursal del JWT. Ver `common/tenant-access`. */
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @RequirePermissions(Permission.CATEGORIES_READ)
  @Get()
  findAll(@CompanyId() companyId: string, @Query() query: QueryCategoriesDto) {
    return this.categoriesService.findPaginatedByCompany(companyId, query);
  }

  @RequirePermissions(Permission.CATEGORIES_READ)
  @Get('all')
  findAllActive(@CompanyId() companyId: string) {
    return this.categoriesService.findAllByCompany(companyId);
  }

  @RequirePermissions(Permission.CATEGORIES_READ)
  @Get(':id')
  findById(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.categoriesService.findByIdInCompany(id, companyId);
  }

  @RequirePermissions(Permission.CATEGORIES_CREATE)
  @Post()
  create(@Body() dto: CreateCategoryDto, @CompanyId() companyId: string) {
    return this.categoriesService.create(companyId, dto);
  }

  @RequirePermissions(Permission.CATEGORIES_UPDATE)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @CompanyId() companyId: string,
  ) {
    return this.categoriesService.update(id, companyId, dto);
  }

  @RequirePermissions(Permission.CATEGORIES_UPDATE)
  @Patch(':id/activate')
  activate(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.categoriesService.activate(id, companyId);
  }

  @RequirePermissions(Permission.CATEGORIES_UPDATE)
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.categoriesService.deactivate(id, companyId);
  }

  @RequirePermissions(Permission.CATEGORIES_DELETE)
  @Delete(':id')
  remove(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.categoriesService.remove(id, companyId);
  }
}
