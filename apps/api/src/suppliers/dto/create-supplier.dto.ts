import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateSupplierDto {
  @IsString({ message: 'name debe ser texto' })
  @MinLength(1, { message: 'name es requerido' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'contactName debe ser texto' })
  contactName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'email no es válido' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'phone debe ser texto' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'rnc debe ser texto' })
  rnc?: string;

  @IsOptional()
  @IsString({ message: 'address debe ser texto' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'notes debe ser texto' })
  notes?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un booleano' })
  isActive?: boolean;
}
