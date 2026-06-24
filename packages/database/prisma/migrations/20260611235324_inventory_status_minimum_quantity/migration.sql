-- AlterTable
ALTER TABLE "Inventory" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "minimumQuantity" DECIMAL(12,3) NOT NULL DEFAULT 0;
