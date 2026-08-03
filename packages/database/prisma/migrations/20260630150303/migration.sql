/*
  Warnings:

  - Added the required column `branchId` to the `AccountPayable` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AccountPayable" ADD COLUMN     "branchId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "AccountPayable_branchId_idx" ON "AccountPayable"("branchId");

-- AddForeignKey
ALTER TABLE "AccountPayable" ADD CONSTRAINT "AccountPayable_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
