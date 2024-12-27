"use server";

import { isAuthorized } from "@/lib/isAdminorSuperAdmin";
import { prisma } from "@/lib/prisma";
import {
  EmailTemplateSchemaType,
  NoReplyEmailSettingsSchema,
  NoReplyEmailSettingsType,
} from "@/zodschemas/authschema";
import { EmailTemplateType } from "@prisma/client";

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
export async function EmailTemplateAction(
  data: EmailTemplateSchemaType,
  type: EmailTemplateType,
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const order = await prisma.emailTemplate.findFirst({
      where: {
        type,
      },
    });
    if (order) {
      await prisma.emailTemplate.update({
        where: { type },
        data: {
          altText: data.altText,
          buttonText: data.buttonText,
          showButton: data.showButton,
          title: data.title,
        },
      });
      return {
        success: true,
        message: "E-posta şablonu başarıyla güncellendi.",
      };
    } else {
      await prisma.emailTemplate.create({
        data: {
          altText: data.altText,
          buttonText: data.buttonText,
          showButton: data.showButton,
          title: data.title,
          type,
        },
      });
      return {
        success: true,
        message: "E-posta şablonu başarıyla oluşturuldu.",
      };
    }
  } catch (error) {
    console.error("E-posta şablonu güncellenirken hata:", error);
    return {
      success: false,
      message: "E-posta şablonu güncellenirken bir hata oluştu.",
    };
  }
}
