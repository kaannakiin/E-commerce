/*
  Warnings:

  - The values [SHIPPED,DELIVERED,CANCELLED] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `addressDetail` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `addressTitle` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `district` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `surname` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `addressId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shippingAmount` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `discount` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `paymentSessionId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `taxRate` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrice` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the `PaymentSession` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[paymentTxnId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `address` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactName` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billingAddressId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buyerInfoId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentTxnId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingAddressId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Made the column `orderId` on table `OrderItem` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'WAITING_3DS', 'SUCCESS', 'FAILURE', 'CANCELED', 'REFUNDED');

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELED', 'REFUNDED');
ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_userId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_addressId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_paymentSessionId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentSession" DROP CONSTRAINT "PaymentSession_addressId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentSession" DROP CONSTRAINT "PaymentSession_userId_fkey";

-- DropIndex
DROP INDEX "Order_userId_status_idx";

-- DropIndex
DROP INDEX "OrderItem_variantId_idx";

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "addressDetail",
DROP COLUMN "addressTitle",
DROP COLUMN "createdAt",
DROP COLUMN "district",
DROP COLUMN "email",
DROP COLUMN "name",
DROP COLUMN "phone",
DROP COLUMN "surname",
DROP COLUMN "type",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "contactName" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "zipCode" TEXT;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "addressId",
DROP COLUMN "note",
DROP COLUMN "shippingAmount",
ADD COLUMN     "billingAddressId" TEXT NOT NULL,
ADD COLUMN     "buyerInfoId" TEXT NOT NULL,
ADD COLUMN     "paymentTxnId" TEXT NOT NULL,
ADD COLUMN     "shippingAddressId" TEXT NOT NULL,
ALTER COLUMN "totalAmount" DROP DEFAULT;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "discount",
DROP COLUMN "paymentSessionId",
DROP COLUMN "taxRate",
DROP COLUMN "totalPrice",
DROP COLUMN "unitPrice",
ADD COLUMN     "category1" TEXT,
ADD COLUMN     "category2" TEXT,
ADD COLUMN     "itemType" TEXT NOT NULL DEFAULT 'PHYSICAL',
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "productId" TEXT NOT NULL,
ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "orderId" SET NOT NULL,
ALTER COLUMN "price" DROP DEFAULT;

-- DropTable
DROP TABLE "PaymentSession";

-- DropEnum
DROP TYPE "AddressType";

-- DropEnum
DROP TYPE "PaymentSessionStatus";

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentId" TEXT,
    "fraudStatus" INTEGER,
    "token" TEXT,
    "callbackUrl" TEXT,
    "paymentProvider" TEXT NOT NULL DEFAULT 'IYZICO',
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "paidPrice" DOUBLE PRECISION,
    "installment" INTEGER NOT NULL DEFAULT 1,
    "basketId" TEXT NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuyerInfo" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "identityNo" TEXT,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuyerInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentLog" (
    "id" TEXT NOT NULL,
    "paymentTxnId" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "rawResponse" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_conversationId_key" ON "PaymentTransaction"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_paymentId_key" ON "PaymentTransaction"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_basketId_key" ON "PaymentTransaction"("basketId");

-- CreateIndex
CREATE INDEX "PaymentLog_paymentTxnId_idx" ON "PaymentLog"("paymentTxnId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_paymentTxnId_key" ON "Order"("paymentTxnId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_paymentTxnId_fkey" FOREIGN KEY ("paymentTxnId") REFERENCES "PaymentTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_billingAddressId_fkey" FOREIGN KEY ("billingAddressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_buyerInfoId_fkey" FOREIGN KEY ("buyerInfoId") REFERENCES "BuyerInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentLog" ADD CONSTRAINT "PaymentLog_paymentTxnId_fkey" FOREIGN KEY ("paymentTxnId") REFERENCES "PaymentTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
