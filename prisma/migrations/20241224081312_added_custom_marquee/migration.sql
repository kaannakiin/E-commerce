-- CreateTable
CREATE TABLE "CustomMarquee" (
    "id" TEXT NOT NULL,
    "text" TEXT,
    "textColor" TEXT,
    "textPadding" TEXT,
    "bgColor" TEXT,
    "fontSize" TEXT,
    "SlidingSpeed" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomMarquee_pkey" PRIMARY KEY ("id")
);
