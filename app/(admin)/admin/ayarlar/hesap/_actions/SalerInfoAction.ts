"use server";
import { DeleteImageToAsset } from "@/lib/deleteImageFile";
import { prisma } from "@/lib/prisma";
import { processImages } from "@/lib/recordImage";
import { SalerInfoFormValues } from "@/zodschemas/authschema";

// Interface tanımlama
interface UpdateData {
  storeName: string;
  storeDescription: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  whatsapp: string;
  seoTitle: string;
  seoDescription: string;
  instagram: string;
  facebook: string;
  pinterest: string;
  twitter: string;
  logo?: {
    create: {
      url: string;
    };
  };
}

const getBaseData = (data: SalerInfoFormValues): UpdateData => ({
  storeName: data.storeName,
  storeDescription: data.storeDescription,
  address: data.address,
  contactEmail: data.contactEmail,
  contactPhone: data.contactPhone,
  whatsapp: data.whatsapp,
  seoTitle: data.seoTitle,
  seoDescription: data.seoDescription,
  instagram: data.instagram,
  facebook: data.facebook,
  pinterest: data.pinterest,
  twitter: data.twitter,
});

export async function AddInfo(data: SalerInfoFormValues): Promise<{
  status: boolean;
  message: string;
}> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const existingInfo = await tx.salerInfo.findFirst({
        include: { logo: true },
      });

      let logoData = undefined;
      if (data.logo && data.logo.length > 0) {
        const processedImages = await processImages(data.logo, {
          isLogo: true,
        });
        if (processedImages && processedImages.length > 0) {
          logoData = {
            url: processedImages[0].url,
          };
        }
      }

      if (existingInfo) {
        const updateData: UpdateData = {
          ...getBaseData(data),
        };

        if (logoData) {
          if (existingInfo.logo?.url) {
            await DeleteImageToAsset(existingInfo.logo.url, {
              isLogo: true,
              maxRetries: 5,
              retryDelay: 200,
            });
          }

          if (existingInfo.logo?.id) {
            await tx.image.delete({
              where: { id: existingInfo.logo.id },
            });
          }

          updateData.logo = {
            create: logoData,
          };
        }

        await tx.salerInfo.update({
          where: { id: existingInfo.id },
          data: updateData,
        });

        return {
          success: true,
          message: "Bilgiler güncellendi",
        };
      }

      await tx.salerInfo.create({
        data: {
          ...getBaseData(data),
          ...(logoData && {
            logo: {
              create: logoData,
            },
          }),
        },
      });

      return {
        success: true,
        message: "Bilgiler kaydedildi",
      };
    });

    return {
      status: result.success,
      message: result.message,
    };
  } catch (error) {
    console.error("AddInfo error:", error);
    return {
      status: false,
      message:
        error instanceof Error
          ? `İşlem başarısız: ${error.message}`
          : "Beklenmeyen bir hata oluştu",
    };
  }
}
