-- AlterTable
ALTER TABLE "BankTransferNotification" ADD COLUMN     "orderChange" DOUBLE PRECISION,
ADD COLUMN     "orderChangeDiscountType" "DiscountType",
ADD COLUMN     "orderChangeType" "OrderChangeType";
