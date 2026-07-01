import { SaleStatus } from '@repo/db';
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

export class QuerySalesDto {
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
  @IsString({ message: 'search debe ser texto' })
  search?: string;

  @IsOptional()
  @IsString({ message: 'branchId debe ser texto' })
  branchId?: string;

  @IsOptional()
  @IsEnum(SaleStatus, { message: 'El estado de la venta no es válido' })
  status?: SaleStatus;

  @IsOptional()
  @IsDateString({}, { message: 'dateFrom debe ser una fecha válida' })
  dateFrom?: string;

  @IsOptional()
  @IsDateString({}, { message: 'dateTo debe ser una fecha válida' })
  dateTo?: string;
}

export type NormalizedQuerySales = {
  page: number;
  take: number;
  search?: string;
  branchId?: string;
  status?: SaleStatus;
  dateFrom?: string;
  dateTo?: string;
};
