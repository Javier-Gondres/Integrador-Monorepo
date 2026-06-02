/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `UserCompany` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "UserCompany_userId_companyId_key";

-- DropIndex
DROP INDEX "UserCompany_userId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "UserCompany_userId_key" ON "UserCompany"("userId");
