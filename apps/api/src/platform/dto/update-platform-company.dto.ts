import { IsOptional, IsString } from 'class-validator';

export class UpdatePlatformCompanyDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'El RNC debe ser texto' })
  rnc?: string;
}
