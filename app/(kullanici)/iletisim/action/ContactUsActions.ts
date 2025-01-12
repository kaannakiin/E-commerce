"use server";

import { prisma } from "@/lib/prisma";
import { ContactUsFormValues, ContactUsSchema } from "@/zodschemas/authschema";

export async function CreateContactUs(
  data: ContactUsFormValues,
): Promise<{ success: boolean; message: string }> {
  try {
    const { email, message, name, subject } = ContactUsSchema.parse(data);
    const RATE_LIMIT_DURATION = 60 * 1000; // 1 dakika
    const existingMessage = await prisma.contactUs.findFirst({
      where: {
        email,
        createdAt: {
          gte: new Date(Date.now() - RATE_LIMIT_DURATION),
        },
      },
    });
    if (existingMessage) {
      return {
        success: false,
        message: "Lütfen yeni bir mesaj göndermeden önce biraz bekleyin.",
      };
    }
    await prisma.contactUs.create({
      data: {
        email,
        message,
        name,
        subject,
      },
    });
    return { success: true, message: "Mesajınız başarıyla gönderildi." };
  } catch (error) {
    return {
      success: false,
      message: "Bir hata oluştu. Lütfen tekrar deneyin.",
    };
  }
}
