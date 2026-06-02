-- Rediseño de Category y Product: multiempresa, soft delete

DROP TABLE IF EXISTS "CategoryProduct";

DROP TABLE IF EXISTS "Category";

ALTER TABLE "Product" DROP COLUMN IF EXISTS "state";
ALTER TABLE "Product" DROP COLUMN IF EXISTS "deleted";

ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "code" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "categoryId" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

UPDATE "Product"
SET "companyId" = (SELECT id FROM "Company" WHERE "deletedAt" IS NULL ORDER BY "createdAt" ASC LIMIT 1)
WHERE "companyId" IS NULL;

UPDATE "Product"
SET "code" = "id"
WHERE "code" IS NULL;

ALTER TABLE "Product" ALTER COLUMN "code" SET NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "price" TYPE DECIMAL(10, 2) USING "price"::decimal;

CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Category_companyId_idx" ON "Category"("companyId");
CREATE INDEX "Category_deletedAt_idx" ON "Category"("deletedAt");

CREATE UNIQUE INDEX "Category_companyId_name_active_key"
ON "Category" ("companyId", "name")
WHERE "deletedAt" IS NULL;

CREATE INDEX "Product_companyId_idx" ON "Product"("companyId");
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX "Product_deletedAt_idx" ON "Product"("deletedAt");

CREATE UNIQUE INDEX "Product_companyId_code_active_key"
ON "Product" ("companyId", "code")
WHERE "deletedAt" IS NULL;

ALTER TABLE "Category" ADD CONSTRAINT "Category_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Product" ADD CONSTRAINT "Product_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
