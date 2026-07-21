import { IsString } from 'class-validator';

export class TransferOwnershipDto {
  @IsString({ message: 'newOwnerUserId no es válido' })
  newOwnerUserId!: string;
}
