import { IsDateString, IsOptional } from 'class-validator';

export class UpdatePayableDto {
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
