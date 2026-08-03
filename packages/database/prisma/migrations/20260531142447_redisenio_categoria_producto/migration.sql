/*
  Warnings:

  - A unique constraint covering the columns `[companyId,name,deletedAt]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,code,deletedAt]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "_CategoryToProduct" ADD CONSTRAINT "_CategoryToProduct_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_CategoryToProduct_AB_unique";

-- CreateIndex
CREATE UNIQUE INDEX "Category_companyId_name_deletedAt_key" ON "Category"("companyId", "name", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Product_companyId_code_deletedAt_key" ON "Product"("companyId", "code", "deletedAt");
