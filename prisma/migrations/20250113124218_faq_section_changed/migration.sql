/*
  Warnings:

  - You are about to drop the column `isFooterVisible` on the `FaqSection` table. All the data in the column will be lost.
  - You are about to drop the column `isHeaderVisible` on the `FaqSection` table. All the data in the column will be lost.
  - You are about to drop the column `isMainPageVisible` on the `FaqSection` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `FaqSection` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `FaqSection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FaqSection" DROP COLUMN "isFooterVisible",
DROP COLUMN "isHeaderVisible",
DROP COLUMN "isMainPageVisible",
DROP COLUMN "text",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "title" DROP NOT NULL;

-- CreateTable
CREATE TABLE "FaqQuestion" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "sectionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FaqQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisplaySettings" (
    "id" TEXT NOT NULL,
    "faqSectionId" TEXT NOT NULL,
    "isMainPage" BOOLEAN NOT NULL DEFAULT false,
    "isHeader" BOOLEAN NOT NULL DEFAULT false,
    "isFooter" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DisplaySettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DisplaySettings_faqSectionId_key" ON "DisplaySettings"("faqSectionId");

-- AddForeignKey
ALTER TABLE "FaqQuestion" ADD CONSTRAINT "FaqQuestion_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "FaqSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisplaySettings" ADD CONSTRAINT "DisplaySettings_faqSectionId_fkey" FOREIGN KEY ("faqSectionId") REFERENCES "FaqSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
