/*import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';

import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() body: { email?: unknown; name?: unknown }) {
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const nameRaw = typeof body.name === 'string' ? body.name.trim() : '';
    if (!email) {
      throw new BadRequestException('El email es obligatorio');
    }
    return this.usersService.create(email, nameRaw || null);
  }
}*/
