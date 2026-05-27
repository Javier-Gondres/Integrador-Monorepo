import { RoleName } from '@repo/db';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
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

export class QueryUsersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page debe ser un entero' })
  @Min(1, { message: 'page debe ser al menos 1' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit debe ser un entero' })
  @Min(1, { message: 'limit debe ser al menos 1' })
  @Max(100, { message: 'limit no puede ser mayor a 100' })
  limit?: number;

  @IsOptional()
  @IsString({ message: 'search debe ser texto' })
  search?: string;

  @IsOptional()
  @IsEnum(RoleName, { message: 'El rol no es válido' })
  role?: RoleName;

  @IsOptional()
  @Transform(({ value }) => parseOptionalBoolean(value))
  @IsBoolean({ message: 'isActive debe ser un booleano' })
  isActive?: boolean;
}

export type NormalizedQueryUsers = {
  page: number;
  limit: number;
  search?: string;
  role?: RoleName;
  isActive?: boolean;
};
