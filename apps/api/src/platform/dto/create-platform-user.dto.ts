import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreatePlatformUserDto {
  @IsEmail({}, { message: 'El email no es válido' })
  email!: string;

  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @IsString({ message: 'El nombre debe ser texto' })
  firstName!: string;

  @IsNotEmpty({ message: 'El apellido no puede estar vacío' })
  @IsString({ message: 'El apellido debe ser texto' })
  lastName!: string;
}
