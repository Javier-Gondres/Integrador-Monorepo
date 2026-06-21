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
import { AuthContext } from 'src/auth/auth.types';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CompanyId } from 'src/common/company';
import { RequirePermissions } from 'src/common/permissions';

import { CreateEmployeeDto } from './dto/create-employee.dto';
import { QueryEmployeesDto } from './dto/query-employees.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeesService } from './employees.service';

/** Branch-scoped: valida sucursal activa vía BranchAccessService. Política empleado ↔ sucursal en `employees/policies`. */
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @RequirePermissions('employees.read')
  @Get()
  findAll(@CompanyId() companyId: string, @Query() query: QueryEmployeesDto) {
    return this.employeesService.findPaginatedByCompany(companyId, query);
  }

  @RequirePermissions('employees.read')
  @Get(':id')
  findById(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.employeesService.findByIdInCompany(id, companyId);
  }

  @RequirePermissions('employees.create')
  @Post()
  create(
    @Body() dto: CreateEmployeeDto,
    @CompanyId() companyId: string,
    @Auth() auth: AuthContext,
  ) {
    return this.employeesService.create(companyId, dto, auth.role);
  }

  @RequirePermissions('employees.update')
  @Patch(':id/restore')
  restore(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.employeesService.restore(id, companyId);
  }

  @RequirePermissions('employees.update')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
    @CompanyId() companyId: string,
  ) {
    return this.employeesService.update(id, companyId, dto);
  }

  @RequirePermissions('employees.delete')
  @Delete(':id')
  remove(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.employeesService.remove(id, companyId);
  }
}
