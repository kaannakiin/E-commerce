/*
  Warnings:

  - You are about to drop the column `title` on the `Blog` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Blog_title_key";

-- AlterTable
ALTER TABLE "Blog" DROP COLUMN "title";
