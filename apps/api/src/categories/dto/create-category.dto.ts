import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString({ message: 'name debe ser texto' })
  @MinLength(1, { message: 'name es requerido' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'description debe ser texto' })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un booleano' })
  isActive?: boolean;
}
