import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateCustomerDto {
  @IsOptional()
  @IsString({ message: 'firstName debe ser texto' })
  @MinLength(1, { message: 'firstName es requerido' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'lastName debe ser texto' })
  @MinLength(1, { message: 'lastName es requerido' })
  lastName?: string;

  @IsOptional()
  @IsString({ message: 'email debe ser texto' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'phone debe ser texto' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'address debe ser texto' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'cedula debe ser texto' })
  cedula?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un booleano' })
  isActive?: boolean;
}
