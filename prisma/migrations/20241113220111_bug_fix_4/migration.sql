/*
  Warnings:

  - You are about to drop the column `discountAmount` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "discountAmount",
ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "price" DOUBLE PRECISION NOT NULL DEFAULT 10,
ADD COLUMN     "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 18;
