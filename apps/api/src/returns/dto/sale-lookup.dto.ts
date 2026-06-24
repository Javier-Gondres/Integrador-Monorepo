import { IsNotEmpty, IsString } from 'class-validator';

export class SaleLookupDto {
  @IsNotEmpty({ message: 'El NCF no puede estar vacio' })
  @IsString({ message: 'El NCF debe ser texto' })
  ncf!: string;
}
