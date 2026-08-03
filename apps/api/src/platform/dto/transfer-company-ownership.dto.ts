import { IsString } from 'class-validator';

export class TransferCompanyOwnershipDto {
  @IsString({ message: 'newOwnerUserId no es válido' })
  newOwnerUserId!: string;
}
