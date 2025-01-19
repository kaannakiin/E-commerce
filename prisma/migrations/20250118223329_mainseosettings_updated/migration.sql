/*
  Warnings:

  - You are about to drop the column `description` on the `MainSeoSettings` table. All the data in the column will be lost.
  - You are about to drop the column `googleId` on the `MainSeoSettings` table. All the data in the column will be lost.
  - You are about to drop the column `googleVerification` on the `MainSeoSettings` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `MainSeoSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MainSeoSettings" DROP COLUMN "description",
DROP COLUMN "googleId",
DROP COLUMN "googleVerification",
DROP COLUMN "title";
