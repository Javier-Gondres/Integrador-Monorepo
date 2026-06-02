import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateCompanyDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'El RNC debe ser texto' })
  rnc?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El email no es válido' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser texto' })
  phone?: string;
}
