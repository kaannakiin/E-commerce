-- CreateEnum
CREATE TYPE "PaymentChannels" AS ENUM ('transfer', 'iyzico', 'tami', 'paytr');

-- CreateTable
CREATE TABLE "PaymentMethods" (
    "id" TEXT NOT NULL,
    "type" "PaymentChannels" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "iyzicoAPIKEY" TEXT,
    "iyzicoSECRETKEY" TEXT,
    "tamiMERCHANTNUMBER" TEXT,
    "tamiTERMİNALNUMBER" TEXT,
    "tamiAPISECRET" TEXT,
    "testMode" BOOLEAN NOT NULL DEFAULT false,
    "minAmount" DOUBLE PRECISION,
    "maxAmount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethods_type_key" ON "PaymentMethods"("type");
