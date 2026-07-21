import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterInvitationDto {
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @IsString({ message: 'El nombre debe ser texto' })
  firstName!: string;

  @IsNotEmpty({ message: 'El apellido no puede estar vacío' })
  @IsString({ message: 'El apellido debe ser texto' })
  lastName!: string;

  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password!: string;
}
