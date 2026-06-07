-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN "invoiceDate" TIMESTAMP(3),
ADD COLUMN "receivedByEmployeeId" TEXT;

-- CreateIndex
CREATE INDEX "Purchase_receivedByEmployeeId_idx" ON "Purchase"("receivedByEmployeeId");

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_receivedByEmployeeId_fkey" FOREIGN KEY ("receivedByEmployeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
