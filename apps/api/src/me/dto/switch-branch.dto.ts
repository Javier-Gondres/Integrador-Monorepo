import { IsNotEmpty, IsString } from 'class-validator';

export class SwitchBranchDto {
  @IsNotEmpty({ message: 'El ID de sucursal es obligatorio' })
  @IsString({ message: 'El ID de sucursal debe ser texto' })
  branchId!: string;
}
