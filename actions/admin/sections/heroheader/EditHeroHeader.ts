"use server";
import { deleteAssetFileWithExtension } from "@/lib/deleteAssetFileWithExtension";
import { isAuthorized } from "@/lib/isAdminorSuperAdmin";
import { prisma } from "@/lib/prisma";
import { RecordVideoToAsset } from "@/lib/recordVideo";
import { EditHeroSchema } from "@/zodschemas/authschema";
import { ZodError } from "zod";

export async function EditHeroHeader(
  formdata: FormData,
  id: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await isAuthorized();
    if (
      !session ||
      (session?.role !== "ADMIN" && session?.role !== "SUPERADMIN")
    ) {
      return { success: false, message: "Unauthorized" };
    }
    if (!id) {
      return { success: false, message: "ID parametresi gereklidir" };
    }

    const imageFile = formdata.get("imageFile");
    const files = imageFile instanceof File ? [imageFile] : [];

    const data = {
      title: formdata.get("title") as string,
      text: formdata.get("text") as string,
      buttonTitle: formdata.get("buttonTitle") as string,
      buttonLink: formdata.get("buttonLink") as string,
      imageFile: imageFile instanceof File ? imageFile : null,
    };

    EditHeroSchema.parse({
      title: data.title,
      text: data.text,
      buttonTitle: data.buttonTitle,
      buttonLink: data.buttonLink,
      imageFile: files,
    });
    if (!(data.imageFile instanceof File)) {
      const updateResult = await prisma.mainHeroSection.update({
        where: { id },
        data: {
          title: data.title,
          text: data.text,
          buttonTitle: data.buttonTitle,
          buttonLink: data.buttonLink,
        },
      });
      return {
        success: true,
        message: "Header başarıyla güncellendi (resim olmadan)",
      };
    }

    const header = await prisma.mainHeroSection.findUnique({
      where: { id },
      include: {
        image: {
          select: {
            id: true,
            url: true,
          },
        },
      },
    });

    if (!header) {
      return { success: false, message: "Böyle bir header bulunamadı" };
    }

    // Yeni dosyayı yükle
    const uploadResults = await RecordVideoToAsset([data.imageFile]);
    if (!uploadResults?.[0]?.url) {
      return { success: false, message: "Dosya yükleme hatası" };
    }

    // Transaction ile tüm işlemleri atomic olarak gerçekleştir
    const result = await prisma.$transaction(async (tx) => {
      // 1. Önce yeni image'i oluştur
      const newImage = await tx.image.create({
        data: {
          url: uploadResults[0].url,
        },
      });

      // 2. MainHeroSection'ı yeni image ile güncelle
      const updated = await tx.mainHeroSection.update({
        where: { id },
        data: {
          title: data.title,
          text: data.text,
          buttonTitle: data.buttonTitle,
          buttonLink: data.buttonLink,
          image: {
            connect: {
              id: newImage.id,
            },
          },
        },
      });

      // 3. Eğer eski bir image varsa, onu sil
      if (header.image) {
        await tx.image.delete({
          where: {
            id: header.image.id,
          },
        });

        // Dosya sisteminden de sil
        await deleteAssetFileWithExtension(header.image.url, ["mp4"]);
      }

      return updated;
    });

    return {
      success: true,
      message: "Header ve görsel başarıyla güncellendi",
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: `Validasyon hatası: ${error.errors[0].message}`,
      };
    }
    console.error("EditHeroHeader Error:", error);
    return {
      success: false,
      message: `İşlem sırasında hata oluştu: ${error.message}`,
    };
  }
}
