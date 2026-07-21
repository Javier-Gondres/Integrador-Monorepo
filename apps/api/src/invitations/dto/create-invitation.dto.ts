import { RoleName } from '@repo/db';
import { IsEmail, IsEnum } from 'class-validator';

export class CreateInvitationDto {
  @IsEmail({}, { message: 'El email no es válido' })
  email!: string;

  @IsEnum(RoleName, { message: 'El rol no es válido' })
  role!: RoleName;
}
