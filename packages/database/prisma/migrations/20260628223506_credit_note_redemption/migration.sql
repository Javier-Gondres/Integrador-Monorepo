-- AlterTable
ALTER TABLE "CreditNote" ADD COLUMN     "redeemedAt" TIMESTAMP(3),
ADD COLUMN     "redeemedInSaleId" TEXT;

-- CreateIndex
CREATE INDEX "CreditNote_redeemedInSaleId_idx" ON "CreditNote"("redeemedInSaleId");

-- AddForeignKey
ALTER TABLE "CreditNote" ADD CONSTRAINT "CreditNote_redeemedInSaleId_fkey" FOREIGN KEY ("redeemedInSaleId") REFERENCES "Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;
