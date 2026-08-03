-- CreateEnum
CREATE TYPE "InventoryAdjustmentReason" AS ENUM ('DAMAGE', 'THEFT', 'EXPIRED', 'COUNT_DIFFERENCE', 'INTERNAL_USE', 'OTHER');

-- AlterTable
ALTER TABLE "InventoryMovement" ADD COLUMN "adjustmentReason" "InventoryAdjustmentReason",
ADD COLUMN "referenceNumber" TEXT;

-- CreateIndex
CREATE INDEX "InventoryMovement_adjustmentReason_idx" ON "InventoryMovement"("adjustmentReason");
