"use server";
import { DeleteImageToAsset } from "@/lib/deleteImageFile";
import { isAuthorized } from "@/lib/isAdminorSuperAdmin";
import { NewRecordAsset } from "@/lib/NewRecordAsset";
import { prisma } from "@/lib/prisma";
import {
  FaqSectionFormValues,
  FaqSectionSchema,
  IdForEverythingType,
} from "@/zodschemas/authschema";
import { ZodError } from "zod";

export async function FaqSectionAction(
  data: FaqSectionFormValues,
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await isAuthorized();
    if (!session) {
      return { success: false, message: "Yetkisiz Erişim" };
    }

    const {
      active,
      description,
      imageFile,
      questions,
      title,
      isFooter,
      isHeader,
      isMainPage,
    } = FaqSectionSchema.parse(data);

    const faqSection = await prisma.faqSection.findFirst({
      include: { image: true, questions: true, displaySettings: true },
    });
    const imageUrl = { success: false, fileName: "" };
    if (imageFile.length > 0) {
      await NewRecordAsset(
        imageFile[0],
        "variant",
        true,
        true,
        false,
        false,
      ).then((res) => {
        imageUrl.success = res.success;
        imageUrl.fileName = res.fileName;
      });
    }

    if (!faqSection) {
      await prisma.faqSection.create({
        data: {
          description: description,
          isActive: active,
          title: title,
          displaySettings: { create: { isFooter, isHeader, isMainPage } },
          image: imageUrl.success
            ? { create: { url: imageUrl.fileName } }
            : undefined,
          questions: {
            create: questions.map((q) => {
              return {
                answer: q.answer,
                question: q.question,
                isActive: q.active,
              };
            }),
          },
        },
      });
      return {
        success: true,
        message: imageUrl.success
          ? "Başarıyla kaydedildi"
          : "Resim yüklenirken hata oluştu fakat resimsiz şekilde kaydedildi",
      };
    } else {
      await prisma.faqQuestion.deleteMany();
      await prisma.displaySettings.deleteMany();
      await prisma.faqSection.deleteMany();
      await prisma.faqSection.create({
        data: {
          description: description,
          isActive: active,
          title: title,
          displaySettings: { create: { isFooter, isHeader, isMainPage } },

          image: imageUrl.success
            ? { create: { url: imageUrl.fileName } }
            : undefined,
          questions: {
            create: questions.map((q) => {
              return {
                answer: q.answer,
                question: q.question,
                isActive: q.active,
              };
            }),
          },
        },
      });
      return {
        success: true,
        message: imageUrl.success
          ? "Başarıyla güncellendi"
          : "Resim yüklenirken hata oluştu fakat resimsiz şekilde güncellendi",
      };
    }
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("ZodError:", error.errors);
      return { success: false, message: "ZodError" };
    }
    return {
      success: false,
      message: "İşlem sırasında bir hata oluştu. Lütfen tekrar deneyiniz. ",
    };
  }
}
export async function FaqSectionDeleteImage(
  url: string,
  id: IdForEverythingType,
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await isAuthorized();
    if (!session) {
      return { success: false, message: "Yetkisiz Erişim" };
    }

    const faqSection = await prisma.faqSection.findFirst({
      where: { id: id },
      include: { image: true },
    });

    if (!faqSection) {
      return {
        success: false,
        message: "S.S.S kısmı bulunamadı.Lütfen ekleyerek devam ediniz.",
      };
    }

    await prisma.faqSection.update({
      where: { id: id },
      data: { image: { delete: true } },
    });

    const deleteResult = await DeleteImageToAsset(url, { type: "variant" });
    if (!deleteResult.success) {
      return { success: false, message: "Resim silinirken hata oluştu" };
    }

    return { success: true, message: "Resim Başarıyla silindi." };
  } catch (error) {
    return {
      success: false,
      message:
        "İşlem sırasında bir hata oluştu: " +
        (error instanceof Error ? error.message : String(error)),
    };
  }
}
