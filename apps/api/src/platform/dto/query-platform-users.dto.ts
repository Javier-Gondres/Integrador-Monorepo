import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
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

export const PlatformUserQueryStatus = {
  ACTIVE: 'ACTIVE',
  BLOCKED: 'BLOCKED',
  DELETED: 'DELETED',
} as const;

export const PlatformUserQueryType = {
  USER: 'USER',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export const PlatformUserMembershipFilter = {
  WITH_COMPANY: 'WITH_COMPANY',
  WITHOUT_COMPANY: 'WITHOUT_COMPANY',
} as const;

export class QueryPlatformUsersDto {
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
  @Transform(({ value }) => parseOptionalBoolean(value))
  @IsBoolean({ message: 'isActive debe ser un booleano' })
  isActive?: boolean;

  @IsOptional()
  @IsEnum(PlatformUserQueryStatus, {
    message: 'status no es válido',
  })
  status?: PlatformUserStatus;

  @IsOptional()
  @IsEnum(PlatformUserQueryType, {
    message: 'type no es válido',
  })
  type?: PlatformUserType;

  @IsOptional()
  @IsString({ message: 'companyId no es válido' })
  companyId?: string;

  @IsOptional()
  @IsEnum(PlatformUserMembershipFilter, {
    message: 'membership no es válido',
  })
  membership?: PlatformUserMembershipFilter;

  @IsOptional()
  @IsDateString({}, { message: 'createdFrom debe ser una fecha válida' })
  createdFrom?: string;

  @IsOptional()
  @IsDateString({}, { message: 'createdTo debe ser una fecha válida' })
  createdTo?: string;
}

export type PlatformUserStatus =
  (typeof PlatformUserQueryStatus)[keyof typeof PlatformUserQueryStatus];
export type PlatformUserType =
  (typeof PlatformUserQueryType)[keyof typeof PlatformUserQueryType];
export type PlatformUserMembershipFilter =
  (typeof PlatformUserMembershipFilter)[keyof typeof PlatformUserMembershipFilter];

export type NormalizedQueryPlatformUsers = {
  page: number;
  take: number;
  search?: string;
  isActive?: boolean;
  status?: PlatformUserStatus;
  type?: PlatformUserType;
  companyId?: string;
  membership?: PlatformUserMembershipFilter;
  createdFrom?: Date;
  createdTo?: Date;
};
