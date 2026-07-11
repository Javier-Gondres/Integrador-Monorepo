-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "address" TEXT;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "rnc" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isTaxExempt" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "itbisRate" DECIMAL(5,2) NOT NULL DEFAULT 18;

-- AlterTable
ALTER TABLE "SaleItem" ADD COLUMN     "taxAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 0;
