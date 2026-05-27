import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBranchDto {
  constructor(name: string, address?: string, phone?: string) {
    this.name = name;
    this.address = address;
    this.phone = phone;
  }

  @IsNotEmpty({ message: 'el nombre no puede estar vacío' })
  name: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  phone?: string;
}
