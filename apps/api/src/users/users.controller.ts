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

import { CreateUserDto } from './dto/createUser.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @RequirePermissions('users.read')
  @Get()
  findAll(@CompanyId() companyId: string, @Query() query: QueryUsersDto) {
    return this.usersService.findAllByCompany(companyId, query);
  }

  @RequirePermissions('users.read')
  @Get('roles')
  listRoles(@Auth() auth: AuthContext) {
    return this.usersService.listRoles(auth.role);
  }

  @RequirePermissions('users.read')
  @Get(':id')
  findById(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.usersService.findByIdInCompany(id, companyId);
  }

  @RequirePermissions('users.create')
  @Post()
  create(
    @Body() createUserDto: CreateUserDto,
    @CompanyId() companyId: string,
    @Auth() auth: AuthContext,
  ) {
    return this.usersService.create(companyId, createUserDto, auth.role);
  }

  @RequirePermissions('users.activate')
  @Patch(':id/activate')
  activate(
    @Param('id') id: string,
    @CompanyId() companyId: string,
    @Auth() auth: AuthContext,
  ) {
    return this.usersService.activateUser(id, companyId, auth.role);
  }

  @RequirePermissions('users.deactivate')
  @Patch(':id/deactivate')
  deactivate(
    @Param('id') id: string,
    @CompanyId() companyId: string,
    @Auth() auth: AuthContext,
  ) {
    return this.usersService.deactivateUser(
      id,
      companyId,
      auth.userId,
      auth.role,
    );
  }

  @RequirePermissions('users.update')
  @Patch(':id/restore')
  restore(
    @Param('id') id: string,
    @CompanyId() companyId: string,
    @Auth() auth: AuthContext,
  ) {
    return this.usersService.restoreUser(id, companyId, auth.role);
  }

  @RequirePermissions('users.update')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CompanyId() companyId: string,
    @Auth() auth: AuthContext,
  ) {
    return this.usersService.updateUser(
      id,
      updateUserDto,
      companyId,
      auth.role,
    );
  }

  @RequirePermissions('users.delete')
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CompanyId() companyId: string,
    @Auth() auth: AuthContext,
  ) {
    return this.usersService.removeUser(id, companyId, auth.userId, auth.role);
  }
}
