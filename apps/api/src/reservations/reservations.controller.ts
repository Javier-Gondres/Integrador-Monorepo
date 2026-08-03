import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Permission } from '@repo/shared';
import { AuthContext } from 'src/auth/auth.types';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Company, type CompanyContext, CompanyId } from 'src/common/company';
import { RequirePermissions } from 'src/common/permissions';

import { CreateReservationDto } from './dto/create-reservation.dto';
import { QueryReservationsDto } from './dto/query-reservations.dto';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @RequirePermissions(Permission.RESERVATIONS_READ)
  @Get()
  findAll(
    @Company() company: CompanyContext,
    @Query() query: QueryReservationsDto,
  ) {
    return this.reservationsService.findAll(company, query);
  }

  @RequirePermissions(Permission.RESERVATIONS_READ)
  @Get(':id')
  findById(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.reservationsService.findById(id, companyId);
  }

  @RequirePermissions(Permission.RESERVATIONS_CREATE)
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

  @RequirePermissions(Permission.RESERVATIONS_CANCEL)
  @Patch(':id/cancel')
  cancel(
    @Param('id') id: string,
    @Company() company: CompanyContext,
    @Auth() auth: AuthContext,
  ) {
    return this.reservationsService.cancel(id, company, auth.userId);
  }
}
