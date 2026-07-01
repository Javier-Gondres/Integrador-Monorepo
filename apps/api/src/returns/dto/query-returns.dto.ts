import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class QueryReturnsDto {
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
  @IsDateString({}, { message: 'dateFrom debe ser una fecha válida' })
  dateFrom?: string;

  @IsOptional()
  @IsDateString({}, { message: 'dateTo debe ser una fecha válida' })
  dateTo?: string;
}

export type NormalizedQueryReturns = {
  page: number;
  take: number;
  search?: string;
  branchId?: string;
  dateFrom?: string;
  dateTo?: string;
};
