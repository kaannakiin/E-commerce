"use server";

import { DeleteImageToAsset } from "@/lib/deleteImageFile";
import { isAuthorized } from "@/lib/isAdminorSuperAdmin";
import { NewRecordAsset } from "@/lib/NewRecordAsset";
import { prisma } from "@/lib/prisma";
import {
  SocialMediaPreviewSchema,
  SocialMediaPreviewType,
} from "@/zodschemas/authschema";

interface DeleteImageOnMainSeoSettings {
  type: "favicon" | "mainPageImage";
}
export async function DeleteImageOnMainSeoSettings({
  type,
}: DeleteImageOnMainSeoSettings): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const session = await isAuthorized();
    if (!session) {
      return { success: false, message: "Yetkisiz işlem" };
    }
    const image = await prisma.mainSeoSettings.findFirst({
      include: { favicon: true, image: true },
    });
    if (!image) {
      return { success: false, message: "Resim bulunamadı" };
    }
    if (type === "favicon") {
      if (!image.favicon) {
        return { success: false, message: "Resim bulunamadı" };
      } else {
        try {
          const response = await DeleteImageToAsset(image.favicon.url, {
            isFavicon: true,
          });
          await prisma.mainSeoSettings.update({
            where: { id: image.id },
            data: { favicon: { delete: true } },
          });
          return {
            success: true,
            message: `${response.success ? "Resim silindi" : "Resim silinemedi fakat veritabanı güncellendi"}`,
          };
        } catch (error) {
          return { success: false, message: "Resim silinemedi" };
        }
      }
    } else if (type === "mainPageImage") {
      if (!image.image) {
        return { success: false, message: "Resim bulunamadı" };
      } else {
        try {
          const response = await DeleteImageToAsset(image.image.url, {
            isFavicon: false,
            type: "variant",
          });
          await prisma.mainSeoSettings.update({
            where: { id: image.id },
            data: { image: { delete: true } },
          });
          return {
            success: true,
            message: `${response.success ? "Resim silindi" : "Resim silinemedi fakat veritabanı güncellendi"}`,
          };
        } catch (error) {
          return { success: false, message: "Resim silinemedi" };
        }
      }
    }
    return { success: false, message: "Resim bulunamadı" };
  } catch (error) {
    return { success: false, message: "Resim silinemedi" };
  }
}
export async function EditMainSeoSettings(
  data: SocialMediaPreviewType,
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await isAuthorized();
    if (!session) {
      return { success: false, message: "Yetkisiz işlem" };
    }

    const mainSeo = await prisma.mainSeoSettings.findFirst({
      include: { favicon: true, image: true },
    });

    const { favicon, logo, themeColor1, themeColor2 } =
      SocialMediaPreviewSchema.parse(data);

    const faviconResult = { success: true, fileName: "" };
    const logoResult = { success: true, fileName: "" };

    if (favicon?.[0]) {
      await NewRecordAsset(
        favicon[0],
        "variant",
        false,
        false,
        false,
        true,
      ).then((res) => {
        faviconResult.fileName = res.fileName;
        faviconResult.success = res.success;
      });
    }

    if (logo?.[0]) {
      await NewRecordAsset(logo[0], "variant", true, false, false, false).then(
        (res) => {
          logoResult.fileName = res.fileName;
          logoResult.success = res.success;
        },
      );
    }

    if (!mainSeo) {
      await prisma.mainSeoSettings.create({
        data: {
          themeColor: themeColor1,
          themeColorSecondary: themeColor2,
          ...(faviconResult.fileName && {
            favicon: {
              create: {
                url: faviconResult.fileName,
              },
            },
          }),
          ...(logoResult.fileName && {
            image: {
              create: {
                url: logoResult.fileName,
              },
            },
          }),
        },
      });
    } else {
      await prisma.mainSeoSettings.update({
        where: {
          id: mainSeo.id,
        },
        data: {
          themeColor: themeColor1,
          themeColorSecondary: themeColor2,
          ...(faviconResult.fileName && {
            favicon: {
              update: {
                url: faviconResult.fileName,
              },
            },
          }),
          ...(logoResult.fileName && {
            image: {
              update: {
                url: logoResult.fileName,
              },
            },
          }),
        },
      });
    }

    const anyImageFailed =
      (favicon?.[0] && !faviconResult.success) ||
      (logo?.[0] && !logoResult.success);

    return {
      success: true,
      message: anyImageFailed
        ? "Resimler yüklenemedi fakat veritabanı güncellendi"
        : "Başarılı",
    };
  } catch (error) {
    return { success: false, message: "Bir hata oluştu" };
  }
}
