/*
  Warnings:

  - You are about to drop the column `taxAmount` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `taxAmount` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `taxRate` on the `OrderItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "taxAmount";

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "taxAmount",
DROP COLUMN "taxRate";
