"use server";
import { prisma } from "@/lib/prisma";
import { AddHeroSchema } from "@/zodschemas/authschema";
import { ZodError } from "zod";
import { RecordImgToAsset } from "@/lib/recordImage";
import { RecordVideoToAsset } from "@/lib/recordVideo";
export async function AddHeroHeader(
  formdata: FormData
): Promise<{ success: boolean; message: string }> {
  try {
    if (!formdata) {
      return { success: false, message: "Form data is required" };
    }

    const data = {
      title: formdata.get("title"),
      text: formdata.get("text"),
      buttonTitle: formdata.get("buttonTitle"),
      buttonLink: formdata.get("buttonLink"),
      imageFile: formdata.getAll("imageFile") as File[],
    };

    // Zod validasyonu
    AddHeroSchema.parse(data);
    return await prisma.$transaction(
      async (tx) => {
        // Mevcut hero kontrolü
        const heroLength = await tx.mainHeroSection.count();
        if (heroLength > 0) {
          return {
            success: false,
            message:
              "Hero Header zaten mevcut, mevcutu silerek devam edebilirsiniz",
          };
        }

        // Button link düzenlemesi
        const buttonLink = !data.buttonLink.toString().startsWith("/")
          ? "/" + data.buttonLink
          : data.buttonLink.toString();

        // Dosya upload işlemi
        const imageUrl = [];
        if (data.imageFile && data.imageFile[0]) {
          try {
            if (data.imageFile[0].type === "video/mp4") {
              imageUrl.push(await RecordVideoToAsset(data.imageFile as File[]));
            } else {
              imageUrl.push(await RecordImgToAsset(data.imageFile as File[]));
            }
          } catch (uploadError) {
            console.error("Dosya yükleme hatası:", uploadError);
            return {
              success: false,
              message: "Dosya yüklenirken bir hata oluştu",
            };
          }
        }

        await tx.mainHeroSection.create({
          data: {
            title: data.title?.toString() || "",
            text: data.text?.toString() || "",
            buttonTitle: data.buttonTitle?.toString() || "",
            buttonLink: buttonLink,
            image: {
              create: {
                url: imageUrl[0][0].url,
              },
            },
          },
        });

        return { success: true, message: "Hero header başarıyla eklendi" };
      },
      {
        maxWait: 5000,
        timeout: 10000,
      }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, message: error.errors[0].message };
    }

    if (error.code === "P2002") {
      return { success: false, message: "Bu kayıt zaten mevcut" };
    }

    console.error("Hero Header ekleme hatası:", error);
    return {
      success: false,
      message: "Hero header eklenirken bir hata oluştu",
    };
  }
}
