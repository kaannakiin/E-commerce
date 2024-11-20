-- CreateTable
CREATE TABLE "FavoriteVariants" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FavoriteVariants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FavoriteVariants_userId_idx" ON "FavoriteVariants"("userId");

-- CreateIndex
CREATE INDEX "FavoriteVariants_variantId_idx" ON "FavoriteVariants"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteVariants_userId_variantId_key" ON "FavoriteVariants"("userId", "variantId");

-- AddForeignKey
ALTER TABLE "FavoriteVariants" ADD CONSTRAINT "FavoriteVariants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteVariants" ADD CONSTRAINT "FavoriteVariants_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
