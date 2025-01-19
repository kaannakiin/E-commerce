/*
  Warnings:

  - You are about to drop the column `seoDescription` on the `SalerInfo` table. All the data in the column will be lost.
  - You are about to drop the column `seoTitle` on the `SalerInfo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SalerInfo" DROP COLUMN "seoDescription",
DROP COLUMN "seoTitle",
ADD COLUMN     "whatsappStarterText" TEXT;
