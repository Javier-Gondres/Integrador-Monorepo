import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString({ message: 'name debe ser texto' })
  @MinLength(1, { message: 'name no puede estar vacío' })
  @MaxLength(100, { message: 'name debe tener máximo 100 caracteres' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'code debe ser texto' })
  @MinLength(1, { message: 'code no puede estar vacío' })
  @MaxLength(30, { message: 'code debe tener máximo 30 caracteres' })
  code?: string;

  @IsOptional()
  @IsString({ message: 'description debe ser texto' })
  @MaxLength(500, { message: 'description debe tener máximo 500 caracteres' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'imageUrl debe ser texto' })
  imageUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'price debe ser un número válido' },
  )
  @Min(0, { message: 'price no puede ser negativo' })
  price?: number;

  @IsOptional()
  @IsArray({ message: 'categoryIds debe ser un arreglo' })
  @ArrayUnique({ message: 'categoryIds no puede tener duplicados' })
  @IsString({ each: true, message: 'cada categoryId debe ser texto' })
  categoryIds?: string[];

  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un booleano' })
  isActive?: boolean;
}
