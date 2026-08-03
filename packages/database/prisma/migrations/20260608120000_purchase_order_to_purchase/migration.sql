-- PurchaseOrder → Purchase: compras ya recibidas, sin flujo de estados.

ALTER TABLE "PurchaseOrder" ADD COLUMN "invoiceNumber" TEXT;

DROP INDEX IF EXISTS "PurchaseOrder_status_idx";
ALTER TABLE "PurchaseOrder" DROP COLUMN "status";
ALTER TABLE "PurchaseOrder" DROP COLUMN "notes";

ALTER TABLE "PurchaseOrderItem" RENAME COLUMN "purchaseOrderId" TO "purchaseId";
ALTER TABLE "InventoryMovement" RENAME COLUMN "purchaseOrderId" TO "purchaseId";
ALTER TABLE "AccountPayable" RENAME COLUMN "purchaseOrderId" TO "purchaseId";

ALTER TABLE "PurchaseOrder" RENAME TO "Purchase";
ALTER TABLE "PurchaseOrderItem" RENAME TO "PurchaseItem";

ALTER INDEX "PurchaseOrder_pkey" RENAME TO "Purchase_pkey";
ALTER INDEX "PurchaseOrder_branchId_idx" RENAME TO "Purchase_branchId_idx";
ALTER INDEX "PurchaseOrder_supplierId_idx" RENAME TO "Purchase_supplierId_idx";
ALTER INDEX "PurchaseOrderItem_pkey" RENAME TO "PurchaseItem_pkey";
ALTER INDEX "PurchaseOrderItem_purchaseOrderId_idx" RENAME TO "PurchaseItem_purchaseId_idx";
ALTER INDEX "PurchaseOrderItem_productId_idx" RENAME TO "PurchaseItem_productId_idx";
ALTER INDEX "AccountPayable_purchaseOrderId_key" RENAME TO "AccountPayable_purchaseId_key";

CREATE INDEX "Purchase_createdAt_idx" ON "Purchase"("createdAt");

DROP TYPE "PurchaseOrderStatus";

-- Rename FK constraints to match Purchase / PurchaseItem table names.
ALTER TABLE "AccountPayable" RENAME CONSTRAINT "AccountPayable_purchaseOrderId_fkey" TO "AccountPayable_purchaseId_fkey";
ALTER TABLE "InventoryMovement" RENAME CONSTRAINT "InventoryMovement_purchaseOrderId_fkey" TO "InventoryMovement_purchaseId_fkey";
ALTER TABLE "Purchase" RENAME CONSTRAINT "PurchaseOrder_branchId_fkey" TO "Purchase_branchId_fkey";
ALTER TABLE "Purchase" RENAME CONSTRAINT "PurchaseOrder_supplierId_fkey" TO "Purchase_supplierId_fkey";
ALTER TABLE "PurchaseItem" RENAME CONSTRAINT "PurchaseOrderItem_productId_fkey" TO "PurchaseItem_productId_fkey";
ALTER TABLE "PurchaseItem" RENAME CONSTRAINT "PurchaseOrderItem_purchaseOrderId_fkey" TO "PurchaseItem_purchaseId_fkey";
