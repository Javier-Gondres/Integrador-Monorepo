import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCashRegisterDto {
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  branchId?: string;
}
