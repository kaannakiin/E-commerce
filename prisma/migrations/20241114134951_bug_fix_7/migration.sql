/*
  Warnings:

  - You are about to drop the column `addressType` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `contactName` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `orderNumber` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `paymentTxnId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the `OrderItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PaymentLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PaymentTransaction` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[paymentId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[basketId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `basketId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paidPrice` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_orderNumber_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_paymentTxnId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_variantId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentLog" DROP CONSTRAINT "PaymentLog_paymentTxnId_fkey";

-- DropIndex
DROP INDEX "Order_orderNumber_idx";

-- DropIndex
DROP INDEX "Order_paymentTxnId_key";

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "addressType",
DROP COLUMN "contactName",
DROP COLUMN "country",
DROP COLUMN "orderNumber",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "tempPaymentId" TEXT;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "paymentTxnId",
DROP COLUMN "status",
DROP COLUMN "totalAmount",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "addressId" TEXT NOT NULL,
ADD COLUMN     "basketId" TEXT NOT NULL,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'TRY',
ADD COLUMN     "paidPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "paymentId" TEXT NOT NULL;

-- DropTable
DROP TABLE "OrderItem";

-- DropTable
DROP TABLE "PaymentLog";

-- DropTable
DROP TABLE "PaymentTransaction";

-- DropEnum
DROP TYPE "AddressType";

-- DropEnum
DROP TYPE "OrderStatus";

-- DropEnum
DROP TYPE "PaymentStatus";

-- CreateTable
CREATE TABLE "TempPayment" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "basketId" TEXT NOT NULL,
    "paidPrice" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TempPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItems" (
    "id" TEXT NOT NULL,
    "basketId" TEXT NOT NULL,
    "paymentTransactionId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',

    CONSTRAINT "OrderItems_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TempPayment_token_key" ON "TempPayment"("token");

-- CreateIndex
CREATE UNIQUE INDEX "TempPayment_paymentId_key" ON "TempPayment"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "TempPayment_basketId_key" ON "TempPayment"("basketId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderItems_paymentTransactionId_key" ON "OrderItems"("paymentTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderItems_basketId_key" ON "OrderItems"("basketId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_paymentId_key" ON "Order"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_basketId_key" ON "Order"("basketId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_id_fkey" FOREIGN KEY ("id") REFERENCES "Order"("basketId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_tempPaymentId_fkey" FOREIGN KEY ("tempPaymentId") REFERENCES "TempPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
