-- CreateTable
CREATE TABLE "Enterprise" (
    "id" TEXT NOT NULL,
    "rnc" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Enterprise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Enterprise_rnc_key" ON "Enterprise"("rnc");
