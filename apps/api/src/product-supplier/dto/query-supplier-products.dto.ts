import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

function parseOptionalBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (value === 'true' || value === true) {
    return true;
  }
  if (value === 'false' || value === false) {
    return false;
  }
  return value as boolean;
}

export class QuerySupplierProductsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page debe ser un entero' })
  @Min(1, { message: 'page debe ser al menos 1' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'take debe ser un entero' })
  @Min(1, { message: 'take debe ser al menos 1' })
  @Max(100, { message: 'take no puede ser mayor a 100' })
  take?: number;

  @IsOptional()
  @IsString({ message: 'search debe ser texto' })
  search?: string;

  @IsOptional()
  @Transform(({ value }) => parseOptionalBoolean(value))
  @IsBoolean({ message: 'isActive debe ser un booleano' })
  isActive?: boolean;
}

export type NormalizedQuerySupplierProducts = {
  page: number;
  take: number;
  search?: string;
  isActive?: boolean;
};
