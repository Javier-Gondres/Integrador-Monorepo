import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString({ message: 'name debe ser texto' })
  @MinLength(1, { message: 'name es requerido' })
  @MaxLength(100, { message: 'name debe tener máximo 100 caracteres' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'description debe ser texto' })
  @MaxLength(500, { message: 'description debe tener máximo 500 caracteres' })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un booleano' })
  isActive?: boolean;
}
