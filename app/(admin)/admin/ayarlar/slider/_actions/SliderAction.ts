"use server";
import { DeleteImageToAsset } from "@/lib/deleteImageFile";
import { isAuthorized } from "@/lib/isAdminorSuperAdmin";
import { NewRecordAsset } from "@/lib/NewRecordAsset";
import { prisma } from "@/lib/prisma";
import { RecordVideoToAsset } from "@/lib/recordVideo";
import {
  AddSliderSchema,
  AddSliderSchemaType,
  IdForEverythingTypeUuid,
} from "@/zodschemas/authschema";
import { AssetType } from "@prisma/client";
import { ZodError } from "zod";

export const addSliderAction = async (
  data: AddSliderSchemaType,
): Promise<{
  success: boolean;
  message: string;
  error?: unknown;
}> => {
  const isAdmin = await isAuthorized();
  if (!isAdmin) {
    return {
      success: false,
      message: "Yetkisiz işlem",
    };
  }

  try {
    AddSliderSchema.parse(data);
    const result = await prisma.$transaction(
      async (tx) => {
        const type = data.imageFile[0].type.startsWith("image/")
          ? "IMAGE"
          : "VIDEO";

        const commonData = {
          title: data.title,
          text: data.text,
          buttonTitle: data.buttonTitle,
          buttonLink: data.buttonLink,
          isPublished: data.isPublished,
          alt: data.alt,
          type: type as AssetType,
          isFunctionality: data.isDescription,
        };

        try {
          const urls =
            type === "VIDEO"
              ? await RecordVideoToAsset(data.imageFile)
              : await NewRecordAsset(
                  data.imageFile[0],
                  "variant",
                  false,
                  true,
                  false,
                  false,
                );

          await tx.mainHeroSection.create({
            data: {
              ...commonData,
              image: {
                create: { url: urls.fileName },
              },
            },
          });

          return {
            success: true,
            message: `Slider başarıyla eklendi (${type})`,
          };
        } catch (error) {
          throw new Error(
            `İşlem hatası: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`,
          );
        }
      },
      { timeout: 30000, maxWait: 35000 },
    );
    return result;
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: "Validation error",
        error: error.errors,
      };
    }
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu",
      error,
    };
  }
};
export const deleteSliderAction = async (
  id: IdForEverythingTypeUuid,
): Promise<{
  success: boolean;
  message: string;
  error?: unknown;
}> => {
  const isAdmin = await isAuthorized();
  if (!isAdmin) {
    return {
      success: false,
      message: "Yetkisiz işlem",
    };
  }
  if (!id) {
    return {
      success: false,
      message: "Eksik bilgi",
    };
  }
  const heroSection = await prisma.mainHeroSection.findUnique({
    where: {
      id: id,
    },
    select: {
      image: {
        select: { url: true },
      },
    },
  });
  if (!heroSection) {
    return {
      success: false,
      message: "Slider bulunamadı",
    };
  }
  try {
    await DeleteImageToAsset(heroSection.image.url);
    await prisma.mainHeroSection.delete({
      where: {
        id: id,
      },
    });
    return {
      success: true,
      message: "Slider silindi",
    };
  } catch (error) {
    return {
      success: false,
      message: "Slider silinemedi",
      error,
    };
  }
};
export const setStatusSliderAction = async (
  id: IdForEverythingTypeUuid,
  status: boolean,
): Promise<{
  success: boolean;
  message: string;
  error?: unknown;
}> => {
  const isAdmin = await isAuthorized();
  if (!isAdmin) {
    return {
      success: false,
      message: "Yetkisiz işlem",
    };
  }
  if (!id) {
    return {
      success: false,
      message: "Eksik bilgi",
    };
  }
  const heroSection = await prisma.mainHeroSection.findUnique({
    where: {
      id: id,
    },
  });
  if (!heroSection) {
    return {
      success: false,
      message: "Slider bulunamadı",
    };
  }
  try {
    await prisma.mainHeroSection.update({
      where: {
        id: id,
      },
      data: {
        isPublished: status,
      },
    });
    return {
      success: true,
      message: "Durum güncellendi",
    };
  } catch (error) {
    return {
      success: false,
      message: "Durum güncellenemedi",
      error,
    };
  }
};
