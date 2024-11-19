-- DropForeignKey
ALTER TABLE "TempPayment" DROP CONSTRAINT "TempPayment_addressId_fkey";

-- DropIndex
DROP INDEX "OrderItems_basketId_key";

-- AlterTable
ALTER TABLE "TempPayment" ALTER COLUMN "addressId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "TempPayment" ADD CONSTRAINT "TempPayment_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
