/*
  Warnings:

  - Added the required column `content` to the `Policies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Policies" ADD COLUMN     "content" TEXT NOT NULL;
