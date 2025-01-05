/*
  Warnings:

  - You are about to drop the column `urlPath` on the `Blog` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[Html]` on the table `Blog` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `Html` to the `Blog` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Blog_urlPath_key";

-- AlterTable
ALTER TABLE "Blog" DROP COLUMN "urlPath",
ADD COLUMN     "Html" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Blog_Html_key" ON "Blog"("Html");
