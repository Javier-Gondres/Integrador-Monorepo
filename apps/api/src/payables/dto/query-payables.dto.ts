import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { PayableStatus } from '@repo/db';

export class QueryPayablesDto {
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
  @IsString({ message: 'supplierId debe ser texto' })
  supplierId?: string;

  @IsOptional()
  @IsEnum(PayableStatus, { message: 'El estado no es válido' })
  status?: PayableStatus;

  @IsOptional()
  @IsDateString({}, { message: 'dateFrom debe ser una fecha válida' })
  dateFrom?: string;

  @IsOptional()
  @IsDateString({}, { message: 'dateTo debe ser una fecha válida' })
  dateTo?: string;
}

export type NormalizedQueryPayables = {
  page: number;
  take: number;
  branchId?: string;
  supplierId?: string;
  status?: PayableStatus;
  dateFrom?: string;
  dateTo?: string;
};
