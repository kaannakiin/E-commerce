"use server";
import { isAuthorized } from "@/lib/isAdminorSuperAdmin";
import { prisma } from "@/lib/prisma";
import {
  EmailTemplateSchemaType,
  NoReplyEmailSettingsSchema,
  NoReplyEmailSettingsType,
} from "@/zodschemas/authschema";
export async function EmailSettingsAction(
  data: NoReplyEmailSettingsType,
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const session = await isAuthorized();
    if (!session) {
      return { success: false, message: "Yetkisiz erişim." };
    }
    NoReplyEmailSettingsSchema.parse(data);

    const email = await prisma.noReplyEmailSetting.findFirst();

    if (email) {
      await prisma.noReplyEmailSetting.update({
        where: {
          id: email.id,
        },
        data: {
          email: data.email,
          password: data.password,
          port: data.port,
          host: data.host,
        },
      });
      return {
        success: true,
        message: "E-posta ayarları başarıyla güncellendi.",
      };
    }

    await prisma.noReplyEmailSetting.create({
      data: {
        email: data.email,
        password: data.password,
        port: data.port,
        host: data.host,
      },
    });
    return {
      success: true,
      message: "E-posta ayarları başarıyla oluşturuldu.",
    };
  } catch (error) {
    console.error("E-posta ayarları güncellenirken hata:", error);
    return {
      success: false,
      message: "E-posta ayarları güncellenirken bir hata oluştu.",
    };
  }
}
