import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBranchDto {
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @IsString({ message: 'El nombre debe ser texto' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'La dirección debe ser texto' })
  address?: string;
}
