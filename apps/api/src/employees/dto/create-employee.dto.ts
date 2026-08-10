import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsString({ message: 'firstName debe ser texto' })
  @MinLength(1, { message: 'firstName es requerido' })
  @MaxLength(100, { message: 'firstName debe tener máximo 100 caracteres' })
  firstName!: string;

  @IsString({ message: 'lastName debe ser texto' })
  @MinLength(1, { message: 'lastName es requerido' })
  @MaxLength(100, { message: 'lastName debe tener máximo 100 caracteres' })
  lastName!: string;

  @IsOptional()
  @IsString({ message: 'phone debe ser texto' })
  @MaxLength(20, { message: 'phone debe tener máximo 20 caracteres' })
  phone?: string;

  @IsEmail({}, { message: 'email no es válido' })
  @IsNotEmpty({ message: 'email es obligatorio' })
  @MaxLength(100, { message: 'email debe tener máximo 100 caracteres' })
  email!: string;

  @MinLength(8, { message: 'password debe tener al menos 8 caracteres' })
  @IsNotEmpty({ message: 'password es obligatorio' })
  password!: string;

  @IsString({ message: 'roleId debe ser texto' })
  @MinLength(1, { message: 'roleId es requerido' })
  roleId!: string;

  @IsString({ message: 'branchId debe ser texto' })
  @MinLength(1, { message: 'branchId es requerido' })
  branchId!: string;

  @IsOptional()
  @IsString({ message: 'position debe ser texto' })
  @MaxLength(100, { message: 'position debe tener máximo 100 caracteres' })
  position?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'salary debe ser un número válido' },
  )
  @Min(0, { message: 'salary no puede ser negativo' })
  @Max(99999999.99, { message: 'salary no puede exceder 99,999,999.99' })
  salary?: number;

  @IsOptional()
  @IsDateString({}, { message: 'hireDate debe ser una fecha válida' })
  hireDate?: string;
}
