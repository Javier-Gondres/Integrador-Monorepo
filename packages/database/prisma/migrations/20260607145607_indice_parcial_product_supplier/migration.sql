-- Un solo proveedor preferido por producto (índice parcial único; no expresable en Prisma schema).
CREATE UNIQUE INDEX "product_supplier_preferred_idx"
ON "ProductSupplier" ("productId")
WHERE "isPreferred" = true;
