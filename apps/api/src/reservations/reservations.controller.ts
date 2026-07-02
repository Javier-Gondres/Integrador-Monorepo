import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AuthContext } from 'src/auth/auth.types';
import { Auth } from 'src/auth/decorators/auth.decorator';
import {
  Company,
  type CompanyContext,
  CompanyId,
  RequireCompany,
} from 'src/common/company';

import { CreateReservationDto } from './dto/create-reservation.dto';
import { QueryReservationsDto } from './dto/query-reservations.dto';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @RequireCompany()
  @Get()
  findAll(
    @Company() company: CompanyContext,
    @Query() query: QueryReservationsDto,
  ) {
    return this.reservationsService.findAll(company, query);
  }

  @RequireCompany()
  @Get(':id')
  findById(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.reservationsService.findById(id, companyId);
  }

  @RequireCompany()
  @Post()
  create(
    @Body() createReservationDto: CreateReservationDto,
    @Company() company: CompanyContext,
    @Auth() auth: AuthContext,
  ) {
    return this.reservationsService.create(
      createReservationDto,
      company,
      auth.userId,
    );
  }

  @RequireCompany()
  @Patch(':id/cancel')
  cancel(
    @Param('id') id: string,
    @Company() company: CompanyContext,
    @Auth() auth: AuthContext,
  ) {
    return this.reservationsService.cancel(id, company, auth.userId);
  }
}
