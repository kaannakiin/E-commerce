-- CreateTable
CREATE TABLE "FaqSection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "imageId" TEXT,
    "isMainPageVisible" BOOLEAN NOT NULL DEFAULT false,
    "isHeaderVisible" BOOLEAN NOT NULL DEFAULT false,
    "isFooterVisible" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FaqSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FaqSection_imageId_key" ON "FaqSection"("imageId");

-- AddForeignKey
ALTER TABLE "FaqSection" ADD CONSTRAINT "FaqSection_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
