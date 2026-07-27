import { PaymentMethod } from '@repo/db';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateReceivablePaymentDto {
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @IsOptional()
  @IsString()
  notes?: string;
}
