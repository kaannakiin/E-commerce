/*
  Warnings:

  - You are about to drop the column `tempPaymentId` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `basketId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `orderStatus` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `paidPrice` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `paidPriceIyzico` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `basketId` on the `OrderItems` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `OrderItems` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrice` on the `OrderItems` table. All the data in the column will be lost.
  - You are about to drop the `TempPayment` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[imageId]` on the table `MainHeroSection` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `alt` to the `MainHeroSection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `MainHeroSection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceIyzico` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Made the column `ip` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `iyzicoPrice` to the `OrderItems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderId` to the `OrderItems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `OrderItems` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('PHYSICAL', 'DIGITAL');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "CancelReason" AS ENUM ('CUSTOMER_REQUEST', 'STOCK_PROBLEM', 'PRICE_ERROR', 'DUPLICATE_ORDER', 'DELIVERY_AREA', 'PAYMENT_ISSUE', 'VARIANT_UNAVAILABLE', 'SYSTEM_ERROR', 'SELLER_REQUEST', 'OTHER');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('NONE', 'REQUESTED', 'PROCESSING', 'COMPLETED', 'REJECTED');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'COMPLETED';

-- DropForeignKey
ALTER TABLE "OrderItems" DROP CONSTRAINT "OrderItems_basketId_fkey";

-- DropForeignKey
ALTER TABLE "TempPayment" DROP CONSTRAINT "TempPayment_addressId_fkey";

-- DropIndex
DROP INDEX "Order_basketId_key";

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "tempPaymentId",
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "temporary" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "MainHeroSection" ADD COLUMN     "alt" TEXT NOT NULL,
ADD COLUMN     "isFunctionality" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" "AssetType" NOT NULL,
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "text" DROP NOT NULL,
ALTER COLUMN "buttonTitle" DROP NOT NULL,
ALTER COLUMN "buttonLink" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "basketId",
DROP COLUMN "currency",
DROP COLUMN "orderStatus",
DROP COLUMN "paidPrice",
DROP COLUMN "paidPriceIyzico",
ADD COLUMN     "cancelPaymentId" TEXT,
ADD COLUMN     "cancelProcessDate" TIMESTAMP(3),
ADD COLUMN     "cancelReason" "CancelReason",
ADD COLUMN     "cardAssociation" TEXT,
ADD COLUMN     "cardFamily" TEXT,
ADD COLUMN     "cardType" TEXT,
ADD COLUMN     "isCancelled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maskedCardNumber" TEXT,
ADD COLUMN     "paymentDate" TIMESTAMP(3),
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "priceIyzico" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "total" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "ip" SET NOT NULL;

-- AlterTable
ALTER TABLE "OrderItems" DROP COLUMN "basketId",
DROP COLUMN "currency",
DROP COLUMN "totalPrice",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isRefunded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "iyzicoPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "orderId" TEXT NOT NULL,
ADD COLUMN     "paymentTransactionId" TEXT,
ADD COLUMN     "refundAmount" DOUBLE PRECISION,
ADD COLUMN     "refundPaymentId" TEXT,
ADD COLUMN     "refundReason" "CancelReason",
ADD COLUMN     "refundRequestDate" TIMESTAMP(3),
ADD COLUMN     "refundStatus" "RefundStatus" DEFAULT 'NONE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "googleCategory" INTEGER,
ADD COLUMN     "googleCategoryId" INTEGER,
ADD COLUMN     "type" "ProductType" NOT NULL DEFAULT 'PHYSICAL';

-- AlterTable
ALTER TABLE "Variant" ADD COLUMN     "canonicalUrl" TEXT,
ADD COLUMN     "richTextDescription" TEXT,
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoTitle" TEXT;

-- AlterTable
ALTER TABLE "_DiscountCodeToVariant" ADD CONSTRAINT "_DiscountCodeToVariant_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_DiscountCodeToVariant_AB_unique";

-- AlterTable
ALTER TABLE "_ProductCategory" ADD CONSTRAINT "_ProductCategory_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ProductCategory_AB_unique";

-- DropTable
DROP TABLE "TempPayment";

-- CreateTable
CREATE TABLE "SalerInfo" (
    "id" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "storeDescription" TEXT,
    "address" TEXT,
    "logoId" TEXT,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "instagram" TEXT,
    "pinterest" TEXT,
    "facebook" TEXT,
    "whatsapp" TEXT,
    "twitter" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalerInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleCategory" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "fullPath" TEXT NOT NULL,
    "parentPath" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "isLeaf" BOOLEAN NOT NULL,
    "parentId" INTEGER,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "breadcrumbs" TEXT[],
    "schemaType" TEXT NOT NULL DEFAULT 'Product',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MainSeoSettings" (
    "id" TEXT NOT NULL,
    "imageId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "themeColor" TEXT NOT NULL,

    CONSTRAINT "MainSeoSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SalerInfo_logoId_key" ON "SalerInfo"("logoId");

-- CreateIndex
CREATE INDEX "GoogleCategory_parentId_idx" ON "GoogleCategory"("parentId");

-- CreateIndex
CREATE INDEX "GoogleCategory_level_idx" ON "GoogleCategory"("level");

-- CreateIndex
CREATE INDEX "GoogleCategory_isLeaf_idx" ON "GoogleCategory"("isLeaf");

-- CreateIndex
CREATE UNIQUE INDEX "MainSeoSettings_imageId_key" ON "MainSeoSettings"("imageId");

-- CreateIndex
CREATE UNIQUE INDEX "MainHeroSection_imageId_key" ON "MainHeroSection"("imageId");

-- CreateIndex
CREATE INDEX "OrderItems_orderId_idx" ON "OrderItems"("orderId");

-- CreateIndex
CREATE INDEX "Product_googleCategoryId_idx" ON "Product"("googleCategoryId");

-- CreateIndex
CREATE INDEX "Variant_slug_idx" ON "Variant"("slug");

-- AddForeignKey
ALTER TABLE "SalerInfo" ADD CONSTRAINT "SalerInfo_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_googleCategoryId_fkey" FOREIGN KEY ("googleCategoryId") REFERENCES "GoogleCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleCategory" ADD CONSTRAINT "GoogleCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "GoogleCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MainSeoSettings" ADD CONSTRAINT "MainSeoSettings_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
