-- Productos iniciales (tablas en minúsculas; renombradas en 20260526131158)
-- Company, User y auth ya existen desde 20260521183557.

CREATE TABLE "product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "state" BOOLEAN NOT NULL DEFAULT true,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "categoryProduct" (
    "id" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categoryProduct_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "categoryProduct_categoryId_productId_key" ON "categoryProduct"("categoryId", "productId");

ALTER TABLE "categoryProduct" ADD CONSTRAINT "categoryProduct_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "categoryProduct" ADD CONSTRAINT "categoryProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
