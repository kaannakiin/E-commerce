-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "addressTitle" TEXT,
ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "ip" TEXT,
ADD COLUMN     "paidPriceIyzico" DOUBLE PRECISION;
