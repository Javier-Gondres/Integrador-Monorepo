CREATE TYPE "PasswordResetTokenPurpose" AS ENUM ('RESET_PASSWORD', 'PLATFORM_ACTIVATION');

ALTER TABLE "PasswordResetToken"
  ADD COLUMN "purpose" "PasswordResetTokenPurpose" NOT NULL DEFAULT 'RESET_PASSWORD',
  ADD COLUMN "revokedAt" TIMESTAMP(3);

CREATE INDEX "PasswordResetToken_purpose_idx" ON "PasswordResetToken"("purpose");
