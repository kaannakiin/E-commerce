"use server";

import MyTemplate, { MyTemplateProps } from "@/emails/MyTemplate";
import { isAuthorized } from "@/lib/isAdminorSuperAdmin";
import { createEmailTemplateProps } from "@/lib/İyzico/helper/helper";
import { prisma } from "@/lib/prisma";
import { EmailTemplateType, VariantType } from "@prisma/client";
import { render } from "@react-email/render";
import nodemailer from "nodemailer";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
interface SendMailProps {
  toEmail: string;
  subject: string;
  type: EmailTemplateType;
  isWebhook?: boolean;
  html?: string;
}

export async function getLogoUrl() {
  try {
    const {
      logo: { url },
      storeName,
    } = await prisma.salerInfo.findFirst({
      select: { logo: { select: { url: true } }, storeName: true },
    });
    return { url, storeName };
  } catch (error) {
    return null;
  }
}
export async function SendMail({
  toEmail,
  subject,
  type,
  html,
  isWebhook = false,
}: SendMailProps): Promise<{
  success: boolean;
  message: string;
}> {
  let transporter: nodemailer.Transporter | null = null;

  try {
    if (!isWebhook) {
      const session = await isAuthorized();
      if (!session) {
        return { success: false, message: "Yetkisiz işlem" };
      }
    }

    const noReplyEmail = await prisma.noReplyEmailSetting.findFirst();
    if (!noReplyEmail) {
      return { success: false, message: "Mail Ayarları bulunamadı." };
    }

    transporter = await nodemailer.createTransport({
      host: noReplyEmail.host,
      name: noReplyEmail.host,
      secure: true,
      auth: { user: noReplyEmail.email, pass: noReplyEmail.password },
      tls: { rejectUnauthorized: true },
    });

    const info = await transporter.sendMail({
      from: noReplyEmail.email,
      to: toEmail,
      subject,
      html,
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
      },
    });

    if (info.accepted.includes(toEmail)) {
      return {
        success: true,
        message: `Mail başarıyla gönderildi. MessageID: ${info.messageId}`,
      };
    } else if (info.rejected.length > 0) {
      return {
        success: false,
        message: `Mail gönderilemedi: ${info.rejected.join(", ")}`,
      };
    } else {
      return {
        success: false,
        message: "Mail gönderimi sırasında beklenmeyen bir durum oluştu",
      };
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu";
    return {
      success: false,
      message: `Mail gönderimi başarısız: ${errorMessage}`,
    };
  } finally {
    if (transporter) await transporter.close();
  }
}

export async function CreateTransporter(): Promise<{
  success: boolean;
  nodemailer?: nodemailer.Transporter;
  email?: string;
}> {
  try {
    const noReplyEmail = await prisma.noReplyEmailSetting.findFirst();
    if (!noReplyEmail) {
      return { success: false };
    }
    return {
      success: true,
      nodemailer: nodemailer.createTransport({
        host: noReplyEmail.host,
        name: noReplyEmail.host,
        secure: true,
        auth: { user: noReplyEmail.email, pass: noReplyEmail.password },
        tls: { rejectUnauthorized: true },
      }),
      email: noReplyEmail.email,
    };
  } catch (error) {
    return { success: false };
  }
}
interface SendOrderCreatedEmailProps {
  products: {
    productImageUrl: string;
    name: string;
    quantity: number;
    type: VariantType;
    price: number;
    unit?: string;
    value: string;
  }[];
  orderNumber: string;
  toEmail: string;
}
interface SendEmailResult {
  success: boolean;
  error?: {
    message: string;
    code?: string;
    details?;
  };
}

export async function sendOrderCreatedEmail({
  toEmail,
  orderNumber,
  products,
}: SendOrderCreatedEmailProps): Promise<SendEmailResult> {
  try {
    const { success, email, nodemailer } = await CreateTransporter();
    if (!success || !nodemailer || !email) {
      return {
        success: false,
        error: {
          message: "E-posta sunucusuna bağlanılamadı",
          code: "TRANSPORTER_ERROR",
          details: { success, email, nodemailer },
        },
      };
    }

    let storeName = "Store";
    let url = "https://placehold.co/200x42?text=Logo";

    try {
      const storeInfo = await getLogoUrl();
      if (storeInfo.url)
        url = `${baseUrl}/api/user/asset/get-image?url=${storeInfo.url}&width=200&height=42&quality=70`;
      if (storeInfo.storeName) storeName = storeInfo.storeName;
    } catch (logoError) {
      console.warn(
        "Logo bilgileri alınamadı, varsayılan değerler kullanılıyor:",
        logoError,
      );
    }

    let renderedHtml: string;
    try {
      renderedHtml = await render(
        <MyTemplate
          type="ORDER_CREATED"
          logoUrl={url}
          products={products}
          buttonUrl={`${baseUrl}/siparis/${orderNumber}`}
          testMode={false}
        />,
      );
    } catch (renderError) {
      console.error("E-posta şablonu render hatası:", renderError);
      return {
        success: false,
        error: {
          message: "E-posta şablonu oluşturulamadı",
          code: "TEMPLATE_RENDER_ERROR",
          details: renderError,
        },
      };
    }

    try {
      await nodemailer.sendMail({
        from: { address: email, name: storeName },
        to: toEmail,
        subject: "Siparişiniz Oluşturuldu",
        html: renderedHtml,
        headers: {
          "X-Priority": "1",
          "X-MSMail-Priority": "High",
        },
      });

      return {
        success: true,
      };
    } catch (sendError) {
      console.error("E-posta gönderim hatası:", {
        error: sendError,
        recipient: toEmail,
        orderNumber,
      });

      return {
        success: false,
        error: {
          message: "E-posta gönderilemedi",
          code: "SEND_ERROR",
          details: sendError,
        },
      };
    }
  } catch (error) {
    console.error("Beklenmeyen hata:", {
      error,
      orderNumber,
      recipient: toEmail,
    });

    return {
      success: false,
      error: {
        message: "Beklenmeyen bir hata oluştu",
        code: "UNEXPECTED_ERROR",
        details: error,
      },
    };
  }
}
interface SendBankTransferConfirmedEmailProps {
  toEmail: string;
  products: {
    productImageUrl: string;
    name: string;
    quantity: number;
    type: VariantType;
    price: number;
    unit?: string;
    value: string;
  }[];
  orderNumber: string;
}
export async function sendBankTransferConfirmedEmail({
  toEmail,
  products,
  orderNumber,
}: SendBankTransferConfirmedEmailProps) {
  try {
    const { success, email, nodemailer } = await CreateTransporter();
    if (!success || !nodemailer || !email) {
      return {
        success: false,
        error: {
          message: "E-posta sunucusuna bağlanılamadı",
          code: "TRANSPORTER_ERROR",
          details: { success, email, nodemailer },
        },
      };
    }
    let storeName = "Store";
    let url = "https://placehold.co/200x42?text=Logo";

    try {
      const storeInfo = await getLogoUrl();
      if (storeInfo.url)
        url = `${baseUrl}/api/user/asset/get-image?url=${storeInfo.url}&width=200&height=42&quality=70`;
      if (storeInfo.storeName) storeName = storeInfo.storeName;
    } catch (logoError) {
      console.warn(
        "Logo bilgileri alınamadı, varsayılan değerler kullanılıyor:",
        logoError,
      );
    }
    let renderedHtml: string;
    try {
      renderedHtml = await render(
        <MyTemplate
          type="ORDER_BANKTRANSFER_ACCEPTED"
          logoUrl={url}
          testMode={false}
          products={products}
          buttonUrl={`${baseUrl}/siparis/${orderNumber}`}
        />,
      );
    } catch (renderError) {
      console.error("E-posta şablonu render hatası:", renderError);
      return {
        success: false,
        error: {
          message: "E-posta şablonu oluşturulamadı",
          code: "TEMPLATE_RENDER_ERROR",
          details: renderError,
        },
      };
    }
    try {
      await nodemailer.sendMail({
        from: { address: email, name: storeName },
        to: toEmail,
        subject: "Havaleniz Onaylandı",
        html: renderedHtml,
        headers: {
          "X-Priority": "1",
          "X-MSMail-Priority": "High",
        },
      });

      return {
        success: true,
      };
    } catch (sendError) {
      console.error("E-posta gönderim hatası:", {
        error: sendError,
        recipient: toEmail,
        orderNumber,
      });

      return {
        success: false,
        error: {
          message: "E-posta gönderilemedi",
          code: "SEND_ERROR",
          details: sendError,
        },
      };
    }
  } catch (error) {
    console.error("Beklenmeyen hata:", {
      error,
      orderNumber,
      recipient: toEmail,
    });
    return {
      success: false,
      error: {
        message: "Beklenmeyen bir hata oluştu",
        code: "UNEXPECTED_ERROR",
        details: error,
      },
    };
  }
}
interface SendWelcomeEmailProps {
  toEmail: string;
}
export async function SendWelcomeEmail({ toEmail }: SendWelcomeEmailProps) {
  try {
    const { success, email, nodemailer } = await CreateTransporter();
    if (!success || !nodemailer || !email) {
      return {
        success: false,
        error: {
          message: "E-posta sunucusuna bağlanılamadı",
          code: "TRANSPORTER_ERROR",
          details: { success, email, nodemailer },
        },
      };
    }
    let storeName = "Store";
    let url = "https://placehold.co/200x42?text=Logo";
    try {
      const storeInfo = await getLogoUrl();
      if (storeInfo.url)
        url = `${baseUrl}/api/user/asset/get-image?url=${storeInfo.url}&width=200&height=42&quality=70`;
      if (storeInfo.storeName) storeName = storeInfo.storeName;
    } catch (logoError) {
      console.warn(
        "Logo bilgileri alınamadı, varsayılan değerler kullanılıyor:",
        logoError,
      );
    }
    let renderedHtml: string;
    try {
      renderedHtml = await render(
        <MyTemplate
          type="WELCOME_MESSAGE"
          buttonUrl={baseUrl}
          logoUrl={url}
          testMode={false}
        />,
      );
    } catch (renderError) {
      console.error("E-posta şablonu render hatası:", renderError);
      return {
        success: false,
        error: {
          message: "E-posta şablonu oluşturulamadı",
          code: "TEMPLATE_RENDER_ERROR",
          details: renderError,
        },
      };
    }
    try {
      await nodemailer.sendMail({
        from: { address: email, name: storeName },
        to: toEmail,
        subject: "Hoşgeldiniz",
        html: renderedHtml,
        headers: {
          "X-Priority": "1",
          "X-MSMail-Priority": "High",
        },
      });

      return {
        success: true,
      };
    } catch (sendError) {
      return {
        success: false,
        error: {
          message: "E-posta gönderilemedi",
          code: "SEND_ERROR",
          details: sendError,
        },
      };
    }
  } catch (error) {}
}
