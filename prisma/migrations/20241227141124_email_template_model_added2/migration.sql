/*
  Warnings:

  - The values [REFUND_ACCEPTED] on the enum `EmailTemplateType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EmailTemplateType_new" AS ENUM ('ORDER_CANCELLED', 'ORDER_CREATED', 'ORDER_INVOICE', 'ORDER_DELIVERED', 'SHIPPING_CREATED', 'SHIPPING_DELIVERED', 'ORDER_REFUNDED', 'REFUND_REQUESTED', 'REFUND_REJECTED', 'PASSWORD_RESET', 'WELCOME_MESSAGE');
ALTER TABLE "EmailTemplate" ALTER COLUMN "type" TYPE "EmailTemplateType_new" USING ("type"::text::"EmailTemplateType_new");
ALTER TYPE "EmailTemplateType" RENAME TO "EmailTemplateType_old";
ALTER TYPE "EmailTemplateType_new" RENAME TO "EmailTemplateType";
DROP TYPE "EmailTemplateType_old";
COMMIT;
