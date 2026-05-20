import { IsNotEmpty } from 'class-validator';

export class CreateEnterpriseDto {
  constructor(rnc: string, name: string) {
    this.rnc = rnc;
    this.name = name;
  }

  @IsNotEmpty({ message: 'el RNC no puede estar vacío' })
  rnc: string;

  @IsNotEmpty({ message: 'el nombre no puede estar vacío' })
  name: string;
}
