-- AlterTable
ALTER TABLE "EmailTemplate" ADD COLUMN     "buttonText" TEXT,
ADD COLUMN     "showButton" BOOLEAN NOT NULL DEFAULT false;
