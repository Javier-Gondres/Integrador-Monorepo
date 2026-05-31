-- Many-to-many implícito: Category[] <-> Product[] (tabla _CategoryToProduct)

CREATE TABLE "_CategoryToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

INSERT INTO "_CategoryToProduct" ("A", "B")
SELECT "categoryId", "id"
FROM "Product"
WHERE "categoryId" IS NOT NULL;

CREATE UNIQUE INDEX "_CategoryToProduct_AB_unique" ON "_CategoryToProduct"("A", "B");
CREATE INDEX "_CategoryToProduct_B_index" ON "_CategoryToProduct"("B");

ALTER TABLE "_CategoryToProduct" ADD CONSTRAINT "_CategoryToProduct_A_fkey"
FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_CategoryToProduct" ADD CONSTRAINT "_CategoryToProduct_B_fkey"
FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_categoryId_fkey";
DROP INDEX IF EXISTS "Product_categoryId_idx";
ALTER TABLE "Product" DROP COLUMN IF EXISTS "categoryId";
