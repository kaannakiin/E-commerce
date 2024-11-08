-- CreateTable
CREATE TABLE "MainHeroSection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "buttonTitle" TEXT NOT NULL,
    "buttonLink" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MainHeroSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MainHeroSection_imageId_idx" ON "MainHeroSection"("imageId");

-- AddForeignKey
ALTER TABLE "MainHeroSection" ADD CONSTRAINT "MainHeroSection_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
