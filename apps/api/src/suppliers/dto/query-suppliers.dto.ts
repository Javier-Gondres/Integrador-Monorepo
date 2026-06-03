import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QuerySuppliersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page debe ser un entero' })
  @Min(1, { message: 'page debe ser al menos 1' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'take debe ser un entero' })
  @Min(1, { message: 'take debe ser al menos 1' })
  take?: number;

  @IsOptional()
  @IsString({ message: 'search debe ser texto' })
  search?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'isActive debe ser un booleano' })
  isActive?: boolean;
}

export type NormalizedQuerySuppliers = {
  page: number;
  take: number;
  search?: string;
  isActive?: boolean;
};
