import { ReservationStatus } from '@repo/db';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class QueryReservationsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page debe ser un entero' })
  @Min(1, { message: 'page debe ser al menos 1' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'take debe ser un entero' })
  @Min(1, { message: 'take debe ser al menos 1' })
  @Max(50, { message: 'take no puede ser mayor a 50' })
  take?: number;

  @IsOptional()
  @IsString({ message: 'branchId debe ser texto' })
  branchId?: string;

  @IsOptional()
  @IsString({ message: 'customerId debe ser texto' })
  customerId?: string;

  @IsOptional()
  @IsEnum(ReservationStatus, { message: 'El estado de la reserva no es válido' })
  status?: ReservationStatus;
}

export type NormalizedQueryReservations = {
  page: number;
  take: number;
  branchId?: string;
  customerId?: string;
  status?: ReservationStatus;
};
