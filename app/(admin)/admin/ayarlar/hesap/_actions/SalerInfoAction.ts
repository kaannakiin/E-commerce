"use server";
import { DeleteImage } from "@/lib/deleteImageFile";
import { prisma } from "@/lib/prisma";
import { processImages } from "@/lib/recordImage";
import { SalerInfoFormValues } from "@/zodschemas/authschema";

// Base saler info data without logo
const getBaseData = (data: SalerInfoFormValues) => ({
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

      // Process logo if provided
      let logoData = undefined;
      if (data.logo && data.logo.length > 0) {
        try {
          const processedImages = await processImages(data.logo, {
            isLogo: true,
          });
          if (processedImages && processedImages.length > 0) {
            logoData = {
              url: processedImages[0].url,
            };
          }
        } catch (error) {
          console.error("Logo processing error:", error);
          return {
            success: false,
            message: "Logo işlenemedi",
          };
        }
      }

      // Handle existing record update
      if (existingInfo) {
        // Handle logo update if new logo is provided
        if (logoData) {
          try {
            // Delete existing logo file
            if (existingInfo.logo?.url) {
              const deleteResult = await DeleteImage(existingInfo.logo.url, {
                isLogo: true,
                maxRetries: 5, // 5 kez deneyecek
                retryDelay: 200, // Her deneme arasında 200ms bekleyecek
              });
              if (!deleteResult.success) {
                return {
                  success: false,
                  message: "Mevcut logo silinemedi",
                };
              }
            }
            if (existingInfo.logo?.id) {
              await tx.image.delete({
                where: { id: existingInfo.logo.id },
              });
            }
          } catch (error) {
            console.error("Logo deletion error:", error);
            return {
              success: false,
              message: "Eski logo silinemedi",
            };
          }
        }

        // Update record
        await tx.salerInfo.update({
          where: { id: existingInfo.id },
          data: {
            ...getBaseData(data),
            ...(logoData && {
              logo: {
                create: logoData,
              },
            }),
          },
        });
      } else {
        // Create new record
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
      }

      return {
        success: true,
        message: existingInfo ? "Bilgiler güncellendi" : "Bilgiler kaydedildi",
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
