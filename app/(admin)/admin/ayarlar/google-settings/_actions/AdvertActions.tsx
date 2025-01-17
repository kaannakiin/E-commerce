"use server";

import { isAuthorized } from "@/lib/isAdminorSuperAdmin";
import { prisma } from "@/lib/prisma";
import {
  googleAnalyticsSchema,
  GoogleAnalyticsSettings,
  googleTagManagerSchema,
  GoogleTagManagerSettings,
  metaPixelSchema,
  MetaPixelSettings,
} from "@/zodschemas/authschema";

export async function GoogleTagAction(data: GoogleTagManagerSettings): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const session = await isAuthorized();
    if (!session) return { success: false, message: "Yetkisiz Erişim" };
    const { containerId, isEnabled } = googleTagManagerSchema.parse(data);
    const mainSeo = await prisma.mainSeoSettings.findFirst();
    if (!mainSeo) {
      return {
        success: false,
        message:
          "Ana SEO ayarları bulunamadı. Daha iyi bir hizmet için lütfen ayarlarınzı yapıp tekrar deneyiniz.",
      };
    }
    await prisma.mainSeoSettings.update({
      where: { id: mainSeo.id },
      data: {
        googleTagManager: containerId,
        googleTagManagerIsEnabled: isEnabled,
      },
    });
    return {
      success: true,
      message: "Google Tag Manager başarıyla güncellendi",
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Bir hata oluştu" };
  }
}
export async function MetaPixelAction(data: MetaPixelSettings): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const session = await isAuthorized();
    if (!session) return { success: false, message: "Yetkisiz Erişim" };
    const { pixelId, isEnabled } = metaPixelSchema.parse(data);
    const mainSeo = await prisma.mainSeoSettings.findFirst();
    if (!mainSeo) {
      return {
        success: false,
        message:
          "Ana SEO ayarları bulunamadı. Daha iyi bir hizmet için lütfen ayarlarınzı yapıp tekrar deneyiniz.",
      };
    }
    await prisma.mainSeoSettings.update({
      where: { id: mainSeo.id },
      data: {
        metaPixel: pixelId,
        metaPixelIsEnabled: isEnabled,
      },
    });
    return {
      success: true,
      message: "Google Tag Manager başarıyla güncellendi",
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Bir hata oluştu" };
  }
}
export async function GoogleAnalyticsAction(
  data: GoogleAnalyticsSettings,
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const session = await isAuthorized();
    if (!session) return { success: false, message: "Yetkisiz Erişim" };
    const { isEnabled, measurementId } = googleAnalyticsSchema.parse(data);
    const mainSeo = await prisma.mainSeoSettings.findFirst();
    if (!mainSeo) {
      return {
        success: false,
        message:
          "Ana SEO ayarları bulunamadı. Daha iyi bir hizmet için lütfen ayarlarınzı yapıp tekrar deneyiniz.",
      };
    }
    await prisma.mainSeoSettings.update({
      where: { id: mainSeo.id },
      data: {
        googleAnalytics: measurementId,
        googleAnalyticsIsEnabled: isEnabled,
      },
    });
    return {
      success: true,
      message: "Google Tag Manager başarıyla güncellendi",
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Bir hata oluştu" };
  }
}
