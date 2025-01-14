/*
  Warnings:

  - You are about to drop the column `order` on the `FaqSection` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "DisplaySettings" DROP CONSTRAINT "DisplaySettings_faqSectionId_fkey";

-- AlterTable
ALTER TABLE "FaqSection" DROP COLUMN "order";

-- AddForeignKey
ALTER TABLE "DisplaySettings" ADD CONSTRAINT "DisplaySettings_faqSectionId_fkey" FOREIGN KEY ("faqSectionId") REFERENCES "FaqSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
