import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePlatformUserDto {
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @IsString({ message: 'El nombre debe ser texto' })
  firstName!: string;

  @IsNotEmpty({ message: 'El apellido no puede estar vacío' })
  @IsString({ message: 'El apellido debe ser texto' })
  lastName!: string;
}
