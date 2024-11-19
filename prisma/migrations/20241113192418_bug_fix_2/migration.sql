/*
  Warnings:

  - You are about to drop the column `addressType` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `isDefault` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `street` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `zipCode` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `billingAddressId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shippingAddressId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `subTotal` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `conversationId` on the `PaymentSession` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `PaymentSession` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `PaymentSession` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `PaymentSession` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `PaymentSession` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PaymentSessionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_billingAddressId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_shippingAddressId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentSession" DROP CONSTRAINT "PaymentSession_orderId_fkey";

-- DropIndex
DROP INDEX "Address_email_idx";

-- DropIndex
DROP INDEX "Address_userId_addressType_idx";

-- DropIndex
DROP INDEX "Order_email_status_idx";

-- DropIndex
DROP INDEX "PaymentSession_conversationId_key";

-- DropIndex
DROP INDEX "PaymentSession_orderId_key";

-- DropIndex
DROP INDEX "PaymentSession_status_userId_idx";

-- DropIndex
DROP INDEX "PaymentSession_token_status_idx";

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "addressType",
DROP COLUMN "country",
DROP COLUMN "firstName",
DROP COLUMN "isDefault",
DROP COLUMN "lastName",
DROP COLUMN "street",
DROP COLUMN "zipCode",
ADD COLUMN     "addressDetail" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "addressTitle" TEXT,
ADD COLUMN     "name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "surname" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "type" "AddressType" NOT NULL DEFAULT 'BOTH';

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "billingAddressId",
DROP COLUMN "email",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "phone",
DROP COLUMN "shippingAddressId",
DROP COLUMN "subTotal",
DROP COLUMN "totalAmount",
ADD COLUMN     "addressId" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "paymentSessionId" TEXT;

-- AlterTable
ALTER TABLE "PaymentSession" DROP COLUMN "conversationId",
DROP COLUMN "email",
DROP COLUMN "orderId",
DROP COLUMN "status",
DROP COLUMN "updatedAt",
ADD COLUMN     "addressId" TEXT,
ADD COLUMN     "discountCode" TEXT;

-- AddForeignKey
ALTER TABLE "PaymentSession" ADD CONSTRAINT "PaymentSession_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_paymentSessionId_fkey" FOREIGN KEY ("paymentSessionId") REFERENCES "PaymentSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
