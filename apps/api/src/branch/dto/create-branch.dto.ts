import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBranchDto {
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @IsString({ message: 'El nombre debe ser texto' })
  @MaxLength(100, { message: 'El nombre debe tener máximo 100 caracteres' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'La dirección debe ser texto' })
  @MaxLength(250, { message: 'La dirección debe tener máximo 250 caracteres' })
  address?: string;
}
