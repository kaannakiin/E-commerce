"use server";
import { createId } from "@paralleldrive/cuid2";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { isAuthorized } from "./isAdminorSuperAdmin";
import { prisma } from "./prisma";

export async function NewRecordAsset(
  file: File,
  type: "category" | "variant" | "richText" = "variant",
  isNeedOgImage: boolean = true,
  isNeedThumbnail: boolean = true,
  isLogo: boolean = false,
  isFavicon: boolean = false,
): Promise<{
  success: boolean;
  message: string;
  secureUrl?: string;
  fileName?: string;
}> {
  try {
    const session = await isAuthorized();
    if (!session) {
      return { success: false, message: "Yetkisiz Erişim" };
    }

    const ASSETS_DIR = path.join(
      process.cwd(),
      type === "richText" ? "rich-tech-assets" : "assets",
    );
    try {
      await fs.access(ASSETS_DIR);
    } catch (error) {
      await fs.mkdir(ASSETS_DIR, { recursive: true });
    }

    const buffer = await file.arrayBuffer();
    if (isLogo) {
      const fileName = generateFileName("logo");
      const filePath = path.join(ASSETS_DIR, `${fileName}.webp`);
      await sharp(Buffer.from(buffer))
        .webp({
          quality: 80,
          effort: 6,
          lossless: false,
          nearLossless: false,
          smartSubsample: true,
          force: false,
        })
        .toFile(filePath);
      return {
        success: true,
        message: "Logo başarıyla kaydedildi",
        fileName: `${fileName}.webp`,
      };
    }

    if (isFavicon) {
      const fileName = generateFileName("favicon");
      const filePath = path.join(ASSETS_DIR, `${fileName}.png`);
      await sharp(Buffer.from(buffer))
        .png({ quality: 80, compressionLevel: 7 })
        .resize(32, 32, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .toFile(filePath);
      return {
        success: true,
        message: "Favicon başarıyla kaydedildi",
        fileName: `${fileName}.webp`,
      };
    }
    const fileName = generateFileName();
    const filePath = path.join(ASSETS_DIR, `${fileName}.webp`);
    await sharp(Buffer.from(buffer))
      .webp({
        quality: 80,
        effort: 6,
        lossless: false,
        nearLossless: false,
        smartSubsample: true,
        force: false,
      })
      .resize(1920, undefined, {
        withoutEnlargement: true,
        position: "centre",
        fit: "cover",
      })
      .withMetadata({ orientation: 1 })
      .toColorspace("srgb")
      .toFile(filePath);

    if (type === "richText") {
      const data = await prisma.richTextImageGallery.create({
        data: {
          url: `${fileName}.webp`,
        },
      });
      return {
        success: true,
        message: "Dosya başarıyla kaydedildi",
        secureUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/user/asset/image-gallery?url=${data.url}&quality=80`,
      };
    }
    if (isNeedThumbnail) {
      const thumbnailPath = path.join(ASSETS_DIR, `${fileName}-thumbnail.webp`);
      await sharp(Buffer.from(buffer))
        .webp({
          quality: 20,
          effort: 6,
          lossless: false,
          nearLossless: false,
          smartSubsample: true,
          force: false,
        })
        .blur(10)
        .toFile(thumbnailPath);
    }
    if (isNeedOgImage) {
      const ogImagePath = path.join(ASSETS_DIR, `${fileName}-og.webp`);
      await sharp(Buffer.from(buffer))
        .webp({
          quality: 85,
          effort: 4,
          lossless: false,
          nearLossless: true,
          smartSubsample: true,
          force: false,
        })
        .resize(1200, 630, {
          withoutEnlargement: true,
          position: "centre",
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .withMetadata({ orientation: 1 })
        .toColorspace("srgb")
        .toFile(ogImagePath);

      return {
        success: true,
        message: "Dosya başarıyla kaydedildi",
        fileName: `${fileName}.webp`,
      };
    }

    return {
      success: true,
      message: "Dosya başarıyla kaydedildi",
      fileName: `${fileName}.webp`,
    };
  } catch (error) {
    console.error("Asset kaydetme hatası:", error);
    return { success: false, message: "Dosya kaydetme sırasında hata oluştu" };
  }
}

type Prefix = "logo" | "favicon" | "og-image" | null;
function generateFileName(prefix: Prefix = null): string {
  const now = new Date();
  const date = now
    .toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\./g, "-");
  const id = createId();
  if (prefix === null) {
    return `${date}-${id}`;
  }
  if (prefix === "og-image") {
    return `${date}-${id}-${prefix}`;
  }
  return `${prefix}${date}-${id}`;
}
