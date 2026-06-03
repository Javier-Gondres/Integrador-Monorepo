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

import { CreateEmployeeDto } from './dto/create-employee.dto';
import { QueryEmployeesDto } from './dto/query-employees.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeesService } from './employees.service';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @RequireCompany()
  @Get()
  findAll(@CompanyId() companyId: string, @Query() query: QueryEmployeesDto) {
    return this.employeesService.findPaginatedByCompany(companyId, query);
  }

  @RequireCompany()
  @Get(':id')
  findById(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.employeesService.findByIdInCompany(id, companyId);
  }

  @RequireCompany()
  @Post()
  create(@Body() dto: CreateEmployeeDto, @CompanyId() companyId: string) {
    return this.employeesService.create(companyId, dto);
  }

  @RequireCompany()
  @Patch(':id/restore')
  restore(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.employeesService.restore(id, companyId);
  }

  @RequireCompany()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
    @CompanyId() companyId: string,
  ) {
    return this.employeesService.update(id, companyId, dto);
  }

  @RequireCompany()
  @Delete(':id')
  remove(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.employeesService.remove(id, companyId);
  }
}
