/*
  Warnings:

  - You are about to drop the column `imageUrls` on the `Category` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Category" DROP COLUMN "imageUrls",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Image" ALTER COLUMN "variantId" DROP NOT NULL;
