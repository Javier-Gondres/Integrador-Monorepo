import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString({ message: 'firstName debe ser texto' })
  @MinLength(1, { message: 'firstName no puede estar vacío' })
  @MaxLength(100, { message: 'firstName debe tener máximo 100 caracteres' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'lastName debe ser texto' })
  @MinLength(1, { message: 'lastName no puede estar vacío' })
  @MaxLength(100, { message: 'lastName debe tener máximo 100 caracteres' })
  lastName?: string;

  @IsOptional()
  @IsString({ message: 'phone debe ser texto' })
  @MaxLength(20, { message: 'phone debe tener máximo 20 caracteres' })
  phone?: string;

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

  @IsOptional()
  @IsDateString({}, { message: 'terminationDate debe ser una fecha válida' })
  terminationDate?: string;

  @IsOptional()
  @IsString({ message: 'branchId debe ser texto' })
  @MinLength(1, { message: 'branchId no puede estar vacío' })
  branchId?: string;
}
