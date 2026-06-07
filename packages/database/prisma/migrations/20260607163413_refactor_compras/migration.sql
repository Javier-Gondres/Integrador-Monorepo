-- RenameForeignKey
ALTER TABLE "AccountPayable" RENAME CONSTRAINT "AccountPayable_purchaseOrderId_fkey" TO "AccountPayable_purchaseId_fkey";

-- RenameForeignKey
ALTER TABLE "InventoryMovement" RENAME CONSTRAINT "InventoryMovement_purchaseOrderId_fkey" TO "InventoryMovement_purchaseId_fkey";

-- RenameForeignKey
ALTER TABLE "Purchase" RENAME CONSTRAINT "PurchaseOrder_branchId_fkey" TO "Purchase_branchId_fkey";

-- RenameForeignKey
ALTER TABLE "Purchase" RENAME CONSTRAINT "PurchaseOrder_supplierId_fkey" TO "Purchase_supplierId_fkey";

-- RenameForeignKey
ALTER TABLE "PurchaseItem" RENAME CONSTRAINT "PurchaseOrderItem_productId_fkey" TO "PurchaseItem_productId_fkey";

-- RenameForeignKey
ALTER TABLE "PurchaseItem" RENAME CONSTRAINT "PurchaseOrderItem_purchaseOrderId_fkey" TO "PurchaseItem_purchaseId_fkey";
