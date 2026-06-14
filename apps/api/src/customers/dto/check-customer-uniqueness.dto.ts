import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';

export class CheckCustomerUniquenessDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  })
  @IsEmail({}, { message: 'El correo debe tener un formato válido' })
  email?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') {
      return value;
    }

    const digits = value.replace(/\D/g, '');
    return digits === '' ? undefined : digits;
  })
  @IsString({ message: 'La cédula debe ser texto' })
  @Matches(/^[0-9]{11}$/, {
    message: 'La cédula debe tener 11 dígitos sin guiones',
  })
  cedula?: string;

  @IsOptional()
  @IsString({ message: 'excludeId debe ser texto' })
  excludeId?: string;
}
