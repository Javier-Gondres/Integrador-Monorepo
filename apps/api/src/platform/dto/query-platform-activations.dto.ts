import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export const PlatformActivationStatus = {
  PENDING: 'PENDING',
  ACTIVATED: 'ACTIVATED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
} as const;

export type PlatformActivationStatusValue =
  (typeof PlatformActivationStatus)[keyof typeof PlatformActivationStatus];

export class QueryPlatformActivationsDto {
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
  @IsEnum(PlatformActivationStatus, { message: 'status no es válido' })
  status?: PlatformActivationStatusValue;
}

export type NormalizedQueryPlatformActivations = {
  page: number;
  take: number;
  search?: string;
  status?: PlatformActivationStatusValue;
};
