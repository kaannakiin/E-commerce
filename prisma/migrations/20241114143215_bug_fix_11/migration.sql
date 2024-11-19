/*
  Warnings:

  - You are about to drop the column `paymentTransactionId` on the `OrderItems` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[addressId]` on the table `TempPayment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `addressId` to the `TempPayment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_tempPaymentId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItems" DROP CONSTRAINT "OrderItems_id_fkey";

-- DropIndex
DROP INDEX "OrderItems_paymentTransactionId_key";

-- AlterTable
ALTER TABLE "OrderItems" DROP COLUMN "paymentTransactionId";

-- AlterTable
ALTER TABLE "TempPayment" ADD COLUMN     "addressId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TempPayment_addressId_key" ON "TempPayment"("addressId");

-- AddForeignKey
ALTER TABLE "TempPayment" ADD CONSTRAINT "TempPayment_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_basketId_fkey" FOREIGN KEY ("basketId") REFERENCES "Order"("basketId") ON DELETE RESTRICT ON UPDATE CASCADE;
