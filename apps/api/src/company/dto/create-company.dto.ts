import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCompanyDto {
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @IsString({ message: 'El nombre debe ser texto' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'El RNC debe ser texto' })
  rnc?: string;
}
