-- CreateEnum
CREATE TYPE "OrderChangeType" AS ENUM ('minus', 'plus');

-- AlterTable
ALTER TABLE "PaymentMethods" ADD COLUMN     "orderChange" DOUBLE PRECISION,
ADD COLUMN     "orderChangeDiscountType" "DiscountType",
ADD COLUMN     "orderChangeType" "OrderChangeType";
