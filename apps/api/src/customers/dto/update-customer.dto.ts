import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const namePattern = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

function normalizeOptionalNumeric(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const digits = value.replace(/\D/g, '');
  return digits === '' ? undefined : digits;
}

export class UpdateCustomerDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto' })
  @MinLength(1, { message: 'El nombre no puede estar vacío' })
  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres' })
  @Matches(namePattern, {
    message: 'El nombre solo puede contener letras y espacios',
  })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'El apellido debe ser texto' })
  @MinLength(1, { message: 'El apellido no puede estar vacío' })
  @MaxLength(100, {
    message: 'El apellido no puede tener más de 100 caracteres',
  })
  @Matches(namePattern, {
    message: 'El apellido solo puede contener letras y espacios',
  })
  lastName?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalString(value))
  @IsEmail({}, { message: 'El correo debe tener un formato válido' })
  email?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalNumeric(value))
  @IsString({ message: 'El teléfono debe ser texto' })
  @Matches(/^[0-9]{10}$/, {
    message: 'El teléfono debe tener 10 dígitos',
  })
  phone?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalString(value))
  @IsString({ message: 'La dirección debe ser texto' })
  @MaxLength(250, {
    message: 'La dirección no puede tener más de 250 caracteres',
  })
  address?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalNumeric(value))
  @IsString({ message: 'La cédula debe ser texto' })
  @Matches(/^[0-9]{11}$/, {
    message: 'La cédula debe tener 11 dígitos',
  })
  cedula?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un booleano' })
  isActive?: boolean;
}
