/*
  Warnings:

  - You are about to drop the column `slug` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Variant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Variant` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Product_slug_key";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "slug";

-- AlterTable
ALTER TABLE "Variant" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Variant_slug_key" ON "Variant"("slug");
