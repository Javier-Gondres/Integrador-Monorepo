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

import { CreateUserDto } from './dto/createUser.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // TODO: @Roles(OWNER, ADMIN) cuando exista RolesGuard
  @RequireCompany()
  @Get()
  findAll(
    @CompanyId() companyId: string,
    @Query() query: QueryUsersDto,
  ) {
    return this.usersService.findAllByCompany(companyId, query);
  }

  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  // TODO: @Roles(OWNER, ADMIN) cuando exista RolesGuard
  @RequireCompany()
  @Post()
  create(
    @Body() createUserDto: CreateUserDto,
    @CompanyId() companyId: string,
  ) {
    return this.usersService.create(companyId, createUserDto);
  }

  @Patch(':id/last-login')
  updateLastLogin(@Param('id') id: string) {
    return this.usersService.updateLastLogin(id);
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
}
