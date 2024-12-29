-- CreateEnum
CREATE TYPE "EmailTemplateType" AS ENUM ('ORDER_CANCELLED', 'ORDER_CREATED', 'ORDER_INVOICE', 'ORDER_DELIVERED', 'SHIPPING_CREATED', 'SHIPPING_DELIVERED', 'ORDER_REFUNDED', 'REFUND_REQUESTED', 'REFUND_ACCEPTED', 'REFUND_REJECTED', 'PASSWORD_RESET', 'WELCOME_MESSAGE');

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" TEXT NOT NULL,
    "type" "EmailTemplateType" NOT NULL,
    "title" TEXT,
    "altText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplate_type_key" ON "EmailTemplate"("type");
