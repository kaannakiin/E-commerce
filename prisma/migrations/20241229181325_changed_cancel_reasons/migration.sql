/*
  Warnings:

  - The `cancelReason` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `refundReason` column on the `OrderItems` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "UserCancelReason" AS ENUM ('WRONG_ADDRESS', 'CHANGED_MIND', 'FOUND_BETTER_PRICE', 'ACCIDENTAL_ORDER', 'DELIVERY_TIME_LONG', 'PAYMENT_CHANGE', 'ITEM_FEATURES', 'QUANTITY_CHANGE', 'PERSONAL_REASON', 'OTHER');

-- CreateEnum
CREATE TYPE "AdminCancelReason" AS ENUM ('STOCK_PROBLEM', 'PRICE_ERROR', 'DUPLICATE_ORDER', 'DELIVERY_AREA', 'PAYMENT_ISSUE', 'VARIANT_UNAVAILABLE', 'SYSTEM_ERROR', 'SELLER_REQUEST', 'FRAUD_SUSPICION', 'ADDRESS_VERIFICATION', 'CUSTOMER_VERIFICATION', 'LOGISTICS_ISSUE', 'OTHER');

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "cancelReason",
ADD COLUMN     "cancelReason" "UserCancelReason";

-- AlterTable
ALTER TABLE "OrderItems" DROP COLUMN "refundReason",
ADD COLUMN     "refundReason" "UserCancelReason";

-- DropEnum
DROP TYPE "CancelReason";
