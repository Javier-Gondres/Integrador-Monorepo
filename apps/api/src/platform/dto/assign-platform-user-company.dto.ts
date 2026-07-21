import { RoleName } from '@repo/db';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class AssignPlatformUserCompanyDto {
  @IsString({ message: 'companyId no es válido' })
  companyId!: string;

  @IsEnum(RoleName, { message: 'role no es válido' })
  role!: RoleName;

  @IsOptional()
  @IsString({ message: 'defaultBranchId no es válido' })
  defaultBranchId?: string;
}
