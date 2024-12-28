"use server";

import {
  EmailTemplateTypeForUI,
  ProductInfo,
} from "@/app/(admin)/admin/ayarlar/e-mail/types/type";
import { prisma } from "@/lib/prisma";
import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import React from "react";
import { EmailLayout } from "@/app/(admin)/admin/ayarlar/e-mail/_components/HtmlTemplate";

interface SendOrderProps {
  type: EmailTemplateTypeForUI;
  email: string;
  products: ProductInfo[];
}

async function getSalerInfo() {
  try {
    const info = await prisma.salerInfo.findFirst({
      select: {
        logo: {
          select: {
            url: true,
          },
        },
        contactEmail: true,
        contactPhone: true,
        pinterest: true,
        instagram: true,
        twitter: true,
        facebook: true,
        storeName: true,
        whatsapp: true,
        address: true,
      },
    });
    if (!info) return null;
    return info;
  } catch (error) {
    return null;
  }
}

export async function SendOrder(
  props: SendOrderProps,
): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Gerekli verileri getir
    const [salerInfo, EmailTemplate, emailSettings] = await Promise.all([
      getSalerInfo(),
      prisma.emailTemplate.findUnique({
        where: { type: "ORDER_CREATED" },
      }),
      prisma.noReplyEmailSetting.findFirst(),
    ]);

    // 2. Email ayarlarını kontrol et
    if (!emailSettings) {
      return {
        success: false,
        message: "Email ayarları bulunamadığı için yollanamadı.",
      };
    }

    // 3. Email template'ini hazırla
    const emailComponent = React.createElement(EmailLayout, {
      salerInfo,
      altText: EmailTemplate?.altText ?? "Default Alt Text",
      title: EmailTemplate?.title ?? "Default Title",
      products: props.products,
    });

    // 4. HTML'e render et
    const html = await render(emailComponent);

    // 5. Email transporter'ı oluştur
    const transporter = nodemailer.createTransport({
      host: emailSettings.host,
      name: emailSettings.host,
      port: emailSettings.port,
      secure: true,
      auth: {
        user: emailSettings.email,
        pass: emailSettings.password,
      },
      tls: {
        rejectUnauthorized: false, // Gerekirse SSL sertifika hatalarını görmezden gel
      },
    });

    // 6. Email'i gönder
    await transporter.sendMail({
      from: `"${"No Reply"}" <${emailSettings.email}>`,
      to: props.email,
      subject: EmailTemplate?.title ?? "Siparişiniz Hakkında",
      html,
      headers: {
        "X-Priority": "1", // Yüksek öncelik
        "X-MSMail-Priority": "High",
      },
    });

    return {
      success: true,
      message: "Email başarıyla yollandı.",
    };
  } catch (error) {
    console.error("Email gönderme hatası:", error);

    // Daha detaylı hata mesajları
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Email gönderilirken bir hata oluştu.";

    return {
      success: false,
      message: `Email gönderilemedi: ${errorMessage}`,
    };
  }
}
