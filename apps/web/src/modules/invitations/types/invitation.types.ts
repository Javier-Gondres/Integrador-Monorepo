import type { TenantRoleName } from "@repo/shared";

/** Valores alineados con el enum `InvitationStatus` de Prisma. */
export const InvitationStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  EXPIRED: "EXPIRED",
  REVOKED: "REVOKED",
} as const;

export type InvitationStatus =
  (typeof InvitationStatus)[keyof typeof InvitationStatus];

/** Invitación tenant listada en configuración de equipo. */
export type TeamInvitation = {
  id: string;
  email: string;
  status: InvitationStatus;
  expiresAt: string;
  role: { name: TenantRoleName };
  invitedBy: { firstName: string; lastName: string };
};
