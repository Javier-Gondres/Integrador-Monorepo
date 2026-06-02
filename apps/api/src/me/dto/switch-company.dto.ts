import { IsNotEmpty, IsString } from 'class-validator';

export class SwitchCompanyDto {
  @IsNotEmpty({ message: 'El ID de empresa es obligatorio' })
  @IsString({ message: 'El ID de empresa debe ser texto' })
  companyId!: string;
}
