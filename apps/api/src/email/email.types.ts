export type InvitationEmailData = {
  to: string;
  inviteeEmail: string;
  companyName: string;
  inviterName: string;
  roleName: string;
  acceptUrl: string;
  expiresAt: Date;
};

export type VerifyEmailData = {
  to: string;
  firstName: string;
  verifyUrl: string;
};

export type ResetPasswordEmailData = {
  to: string;
  firstName: string;
  resetUrl: string;
};
