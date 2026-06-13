import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CloseShiftDto {
  @IsNotEmpty({ message: 'El monto de cierre es requerido' })
  @IsNumber({}, { message: 'El monto de cierre debe ser un número' })
  @Min(0, { message: 'El monto de cierre no puede ser negativo' })
  montoCierre!: number;
}
