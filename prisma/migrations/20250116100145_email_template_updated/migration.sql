/*
  Warnings:

  - The values [REFUND_REQUESTED,REFUND_REJECTED] on the enum `EmailTemplateType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EmailTemplateType_new" AS ENUM ('ORDER_CANCELLED', 'ORDER_CREATED', 'ORDER_INVOICE', 'ORDER_DELIVERED', 'ORDER_ACCEPTED', 'ORDER_REFUNDED', 'ORDER_REFUND_REQUESTED', 'ORDER_REFUND_REJECTED', 'ORDER_BANKTRANSFER_CREATED', 'ORDER_BANKTRANSFER_ACCEPTED', 'ORDER_BANKTRANSFER_REJECTED', 'SHIPPING_CREATED', 'SHIPPING_DELIVERED', 'PASSWORD_RESET', 'WELCOME_MESSAGE', 'OTHER');
ALTER TABLE "EmailTemplate" ALTER COLUMN "type" TYPE "EmailTemplateType_new" USING ("type"::text::"EmailTemplateType_new");
ALTER TYPE "EmailTemplateType" RENAME TO "EmailTemplateType_old";
ALTER TYPE "EmailTemplateType_new" RENAME TO "EmailTemplateType";
DROP TYPE "EmailTemplateType_old";
COMMIT;
