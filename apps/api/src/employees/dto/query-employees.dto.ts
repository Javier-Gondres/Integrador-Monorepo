import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryEmployeesDto {
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

  @IsOptional()
  @IsString({ message: 'branchId debe ser texto' })
  branchId?: string;
}

export type NormalizedQueryEmployees = {
  page: number;
  take: number;
  search?: string;
  isActive?: boolean;
  branchId?: string;
};
