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
import { CompanyId, RequireCompany } from 'src/common/company';

import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/createUser.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // TODO: @Roles(OWNER, ADMIN) cuando exista RolesGuard
  @RequireCompany()
  @Get()
  findAll(@CompanyId() companyId: string, @Query() query: QueryUsersDto) {
    return this.usersService.findAllByCompany(companyId, query);
  }

  @RequireCompany()
  @Get('roles')
  listRoles() {
    return this.usersService.listRoles();
  }

  @RequireCompany()
  @Get('me')
  getMe(@Auth() auth: AuthContext, @CompanyId() companyId: string) {
    return this.usersService.findMe(auth.userId, companyId);
  }

  @RequireCompany()
  @Patch('me')
  updateMe(
    @Auth() auth: AuthContext,
    @CompanyId() companyId: string,
    @Body() dto: UpdateMeDto,
  ) {
    return this.usersService.updateMe(auth.userId, companyId, dto);
  }

  @RequireCompany()
  @Patch('me/password')
  changePassword(@Auth() auth: AuthContext, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(auth.userId, dto);
  }

  @RequireCompany()
  @Get(':id')
  findById(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.usersService.findByIdInCompany(id, companyId);
  }

  // TODO: @Roles(OWNER, ADMIN) cuando exista RolesGuard
  @RequireCompany()
  @Post()
  create(@Body() createUserDto: CreateUserDto, @CompanyId() companyId: string) {
    return this.usersService.create(companyId, createUserDto);
  }

  // TODO: @Roles(OWNER, ADMIN) cuando exista RolesGuard
  @RequireCompany()
  @Patch(':id/activate')
  activate(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.usersService.activateUser(id, companyId);
  }

  // TODO: @Roles(OWNER, ADMIN) cuando exista RolesGuard
  @RequireCompany()
  @Patch(':id/deactivate')
  deactivate(
    @Param('id') id: string,
    @CompanyId() companyId: string,
    @Auth() auth: AuthContext,
  ) {
    return this.usersService.deactivateUser(id, companyId, auth.userId);
  }

  // TODO: @Roles(OWNER, ADMIN) cuando exista RolesGuard
  @RequireCompany()
  @Patch(':id/restore')
  restore(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.usersService.restoreUser(id, companyId);
  }

  @RequireCompany()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CompanyId() companyId: string,
  ) {
    return this.usersService.updateUser(id, updateUserDto, companyId);
  }

  // TODO: @Roles(OWNER, ADMIN) cuando exista RolesGuard
  @RequireCompany()
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CompanyId() companyId: string,
    @Auth() auth: AuthContext,
  ) {
    return this.usersService.removeUser(id, companyId, auth.userId);
  }
}
