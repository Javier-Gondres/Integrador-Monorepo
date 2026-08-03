import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class OpenShiftDto {
  @IsNotEmpty({ message: 'El monto de apertura es requerido' })
  @IsNumber({}, { message: 'El monto de apertura debe ser un número' })
  @Min(0, { message: 'El monto de apertura no puede ser negativo' })
  montoApertura!: number;
}
