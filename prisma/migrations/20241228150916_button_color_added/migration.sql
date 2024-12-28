/*
  Warnings:

  - You are about to drop the column `showButton` on the `EmailTemplate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EmailTemplate" DROP COLUMN "showButton",
ADD COLUMN     "buttonColor" TEXT;
