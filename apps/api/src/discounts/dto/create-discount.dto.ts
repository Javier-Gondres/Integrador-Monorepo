import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateDiscountDto {
  @IsString({ message: 'name debe ser texto' })
  @MinLength(1, { message: 'name es requerido' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'description debe ser texto' })
  description?: string;

  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'percentage debe ser un número válido' },
  )
  @Min(0, { message: 'percentage no puede ser menor que 0' })
  @Max(100, { message: 'percentage no puede ser mayor que 100' })
  percentage!: number;

  @IsOptional()
  @IsDateString({}, { message: 'startDate debe ser una fecha válida' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'endDate debe ser una fecha válida' })
  endDate?: string;

  @IsOptional()
  @IsArray({ message: 'productIds debe ser un arreglo' })
  @ArrayUnique({ message: 'productIds no puede tener duplicados' })
  @IsString({ each: true, message: 'cada productId debe ser texto' })
  productIds?: string[];

  @IsOptional()
  @IsArray({ message: 'categoryIds debe ser un arreglo' })
  @ArrayUnique({ message: 'categoryIds no puede tener duplicados' })
  @IsString({ each: true, message: 'cada categoryId debe ser texto' })
  categoryIds?: string[];

  @IsOptional()
  @IsArray({ message: 'excludedProductIds debe ser un arreglo' })
  @ArrayUnique({ message: 'excludedProductIds no puede tener duplicados' })
  @IsString({ each: true, message: 'cada excludedProductId debe ser texto' })
  excludedProductIds?: string[];

  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un booleano' })
  isActive?: boolean;
}
