import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString({ message: 'name debe ser texto' })
  @MinLength(1, { message: 'name no puede estar vacío' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'description debe ser texto' })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un booleano' })
  isActive?: boolean;
}
