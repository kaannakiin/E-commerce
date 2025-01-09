-- CreateTable
CREATE TABLE "BankTransferNotification" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "transactionTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankTransferNotification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BankTransferNotification" ADD CONSTRAINT "BankTransferNotification_orderNumber_fkey" FOREIGN KEY ("orderNumber") REFERENCES "Order"("orderNumber") ON DELETE RESTRICT ON UPDATE CASCADE;
