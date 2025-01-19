"use server";

import { DeleteImageToAsset } from "@/lib/deleteImageFile";
import { isAuthorized } from "@/lib/isAdminorSuperAdmin";
import { NewRecordAsset } from "@/lib/NewRecordAsset";
import { prisma } from "@/lib/prisma";
import { SalerInfoFormValues, SalerInfoSchema } from "@/zodschemas/authschema";

export async function AddInfo(
  data: SalerInfoFormValues,
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await isAuthorized();
    if (!session) return { success: false, message: "Yetkisiz Erişim" };
    const {
      address,
      contactEmail,
      contactPhone,
      facebook,
      instagram,
      logo,
      pinterest,
      storeDescription,
      storeName,
      twitter,
      whatsapp,
      whatsappStarterText,
    } = SalerInfoSchema.parse(data);
    const salerInfo = await prisma.salerInfo.findFirst();
    let logoUrl = null;
    if (logo.length > 0) {
      const uploadResult = await NewRecordAsset(
        logo[0],
        "variant",
        false, // og image gerekli değil
        false, // thumbnail gerekli değil
        true, // logo olduğunu belirt
        false, // favicon değil
      );

      if (uploadResult.success) {
        logoUrl = uploadResult.fileName;
      }
    }
    if (salerInfo) {
      await prisma.salerInfo.update({
        where: { id: salerInfo.id },
        data: {
          address,
          contactEmail,
          contactPhone,
          facebook,
          instagram,
          logo: logoUrl ? { create: { url: logoUrl } } : undefined,
          pinterest,
          storeDescription,
          storeName,
          twitter,
          whatsapp,
          whatsappStarterText,
        },
      });
    } else {
      await prisma.salerInfo.create({
        data: {
          address,
          contactEmail,
          contactPhone,
          facebook,
          instagram,
          logo: logoUrl ? { create: { url: logoUrl } } : undefined,
          pinterest,
          storeDescription,
          storeName,
          twitter,
          whatsapp,
          whatsappStarterText,
        },
      });
    }
    return { success: true, message: "Başarıyla oluşturuldu." };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Bir hata oluştu. Lütfen tekrar deneyiniz.",
    };
  }
}
export async function DeleteImageOnSalerInfo(
  url: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await isAuthorized();
    if (!session) return { success: false, message: "Yetkisiz Erişim" };
    const salerInfo = await prisma.salerInfo.findFirst({
      include: { logo: { select: { url: true } } },
    });
    if (!salerInfo || !salerInfo.logo) {
      return { success: false, message: "Satıcı bilgisi bulunamadı" };
    }
    const deleteAsset = await DeleteImageToAsset(url, { isLogo: true });
    if (salerInfo.logo.url === url) {
      await prisma.salerInfo.update({
        where: { id: salerInfo.id },
        data: { logo: { delete: true } },
      });
      return {
        success: true,
        message: deleteAsset.success
          ? "Başarılı"
          : "Resim silindi fakat veritabanında güncelleme yapılamadı.",
      };
    }
    return { success: false, message: "Resim bulunamadı" };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Bir hata oluştu. Lütfen tekrar deneyiniz.",
    };
  }
}
