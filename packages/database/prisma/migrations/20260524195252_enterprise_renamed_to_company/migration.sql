/*
  Warnings:

  - You are about to drop the `Enterprise` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Enterprise";

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "rnc" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_rnc_key" ON "Company"("rnc");
