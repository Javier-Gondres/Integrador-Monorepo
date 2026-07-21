import { IsEnum } from 'class-validator';

export const PlatformUserStatus = {
  ACTIVE: 'ACTIVE',
  BLOCKED: 'BLOCKED',
} as const;

export type PlatformUserStatusValue =
  (typeof PlatformUserStatus)[keyof typeof PlatformUserStatus];

export class UpdatePlatformUserStatusDto {
  @IsEnum(PlatformUserStatus, { message: 'status no es válido' })
  status!: PlatformUserStatusValue;
}
