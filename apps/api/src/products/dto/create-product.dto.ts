import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'name debe ser texto' })
  @MinLength(1, { message: 'name es requerido' })
  name!: string;

  @IsString({ message: 'code debe ser texto' })
  @MinLength(1, { message: 'code es requerido' })
  code!: string;

  @IsOptional()
  @IsString({ message: 'description debe ser texto' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'imageUrl debe ser texto' })
  imageUrl?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'price debe ser un número válido' })
  @Min(0, { message: 'price no puede ser negativo' })
  price!: number;

  @IsOptional()
  @IsArray({ message: 'categoryIds debe ser un arreglo' })
  @ArrayUnique({ message: 'categoryIds no puede tener duplicados' })
  @IsString({ each: true, message: 'cada categoryId debe ser texto' })
  categoryIds?: string[];

  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un booleano' })
  isActive?: boolean;
}
