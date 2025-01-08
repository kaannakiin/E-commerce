"use server";
import path from "path";
import fs from "fs/promises";
import { createId } from "@paralleldrive/cuid2";
import sharp from "sharp";
import { isAuthorized } from "./isAdminorSuperAdmin";
import { prisma } from "./prisma";

export async function RecordAssetForRichText(
  file: File,
): Promise<{ success: boolean; message: string; secureUrl?: string }> {
  try {
    const session = await isAuthorized();
    if (!session) {
      return { success: false, message: "Yetkisiz Erişim" };
    }

    const ASSETS_DIR = path.join(process.cwd(), "rich-text-assets");
    try {
      await fs.access(ASSETS_DIR);
    } catch (error) {
      await fs.mkdir(ASSETS_DIR, { recursive: true });
    }

    const id = createId();
    const filePath = path.join(ASSETS_DIR, `${id}.jpg`);
    const buffer = await file.arrayBuffer();

    await sharp(Buffer.from(buffer))
      .jpeg({ quality: 80 })
      .resize(1920, undefined, {
        withoutEnlargement: true,
        fit: "inside",
      })
      .toFile(filePath);

    const data = await prisma.richTextImageGallery.create({
      data: {
        url: `${id}.jpg`,
      },
    });

    return {
      success: true,
      message: "Dosya başarıyla kaydedildi",
      secureUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/user/asset/image-gallery?url=${data.url}&quality=80`,
    };
  } catch (error) {
    console.error("Asset kaydetme hatası:", error);
    return { success: false, message: "Dosya kaydetme sırasında hata oluştu" };
  }
}
