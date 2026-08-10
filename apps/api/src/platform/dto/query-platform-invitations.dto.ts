import { InvitationStatus } from '@repo/db';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryPlatformInvitationsDto {
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
  @IsString({ message: 'companyId no es válido' })
  companyId?: string;

  @IsOptional()
  @IsEnum(InvitationStatus, { message: 'status no es válido' })
  status?: InvitationStatus;
}

export type NormalizedQueryPlatformInvitations = {
  page: number;
  take: number;
  search?: string;
  companyId?: string;
  status?: InvitationStatus;
};
