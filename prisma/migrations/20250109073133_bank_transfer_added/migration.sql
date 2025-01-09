-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('BANK_TRANSFER', 'IYZICO', 'TAMI');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentType" "PaymentType" NOT NULL DEFAULT 'IYZICO';
