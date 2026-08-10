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

function normalizeOptionalDigits(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const digits = value.replace(/\D/g, '');
  return digits === '' ? undefined : digits;
}

export class UpdateSupplierDto {
  @IsOptional()
  @IsString({ message: 'name debe ser texto' })
  @MinLength(1, { message: 'name no puede estar vacío' })
  @MaxLength(100, { message: 'name debe tener máximo 100 caracteres' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'contactName debe ser texto' })
  @MaxLength(100, { message: 'contactName debe tener máximo 100 caracteres' })
  contactName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'email no es válido' })
  @MaxLength(100, { message: 'email debe tener máximo 100 caracteres' })
  email?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalDigits(value))
  @IsString({ message: 'phone debe ser texto' })
  @Matches(/^[0-9]{10}$/, {
    message: 'El teléfono debe tener 10 dígitos (ej: 8091234567)',
  })
  phone?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalDigits(value))
  @IsString({ message: 'rnc debe ser texto' })
  @Matches(/^[0-9]{9}$|^[0-9]{11}$/, {
    message:
      'El RNC debe tener 9 dígitos (jurídico) u 11 dígitos (físico/cédula)',
  })
  rnc?: string;

  @IsOptional()
  @IsString({ message: 'address debe ser texto' })
  @MaxLength(250, { message: 'address debe tener máximo 250 caracteres' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'notes debe ser texto' })
  @MaxLength(500, { message: 'notes debe tener máximo 500 caracteres' })
  notes?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un booleano' })
  isActive?: boolean;
}
