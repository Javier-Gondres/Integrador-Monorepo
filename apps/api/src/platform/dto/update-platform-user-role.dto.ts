import { RoleName } from '@repo/db';
import { IsEnum } from 'class-validator';

export class UpdatePlatformUserRoleDto {
  @IsEnum(RoleName, { message: 'role no es válido' })
  role!: RoleName;
}
