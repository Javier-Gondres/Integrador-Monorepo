-- Soft delete en master data + índices únicos compuestos (permite reutilizar slug/email tras eliminar)

-- DropIndex
DROP INDEX "Company_slug_key";

-- DropIndex
DROP INDEX "Role_name_key";

-- DropIndex
DROP INDEX "User_email_key";

-- DropIndex
DROP INDEX "UserCompany_userId_key";

-- AlterTable
ALTER TABLE "Branch" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Company" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Role" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "UserCompany" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Branch_deletedAt_idx" ON "Branch"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_deletedAt_key" ON "Company"("slug", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_deletedAt_key" ON "Role"("name", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_deletedAt_key" ON "User"("email", "deletedAt");

-- CreateIndex
CREATE INDEX "UserCompany_deletedAt_idx" ON "UserCompany"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserCompany_userId_deletedAt_key" ON "UserCompany"("userId", "deletedAt");
