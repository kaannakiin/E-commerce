-- AlterTable
ALTER TABLE "MainSeoSettings" ADD COLUMN     "googleAnalytics" TEXT,
ADD COLUMN     "googleAnalyticsIsEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "googleTagManager" TEXT,
ADD COLUMN     "googleTagManagerIsEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metaPixel" TEXT,
ADD COLUMN     "metaPixelIsEnabled" BOOLEAN NOT NULL DEFAULT false;
