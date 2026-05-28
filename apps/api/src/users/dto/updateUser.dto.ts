import { RoleName, User } from '@repo/db';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto implements Partial<
  Pick<User, 'firstName' | 'lastName'> & { role?: RoleName }
> {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'El apellido debe ser texto' })
  lastName?: string;

  @IsOptional()
  @IsEnum(RoleName, { message: 'El rol no es válido' })
  role?: RoleName;
}
