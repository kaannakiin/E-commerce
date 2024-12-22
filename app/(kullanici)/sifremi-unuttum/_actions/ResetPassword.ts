"use server";

import { createTransporter } from "@/lib/mailTransporter";
import { prisma } from "@/lib/prisma";
import {
  forgotPasswordSchema,
  ForgotPasswordSchemaType,
  passwordCheckSchema,
  PasswordCheckType,
} from "@/zodschemas/authschema";
import { v4 as uuidv4 } from "uuid";
import { hash } from "bcryptjs";
export async function ResetPassword(
  data: ForgotPasswordSchemaType,
): Promise<{ success: boolean; message: string }> {
  try {
    const { email } = forgotPasswordSchema.parse(data);
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      return { success: true, message: "E-posta gönderilmiştir" };
    }
    const token = uuidv4();
    await prisma.passwordReset.deleteMany({
      where: {
        userId: user.id,
        used: false,
      },
    });
    await prisma.passwordReset.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 15),
      },
    });
    const transporter = createTransporter({
      auth: {
        user: process.env.NO_REPLY_EMAIL!,
        pass: process.env.NO_REPLY_EMAIL_PASSWORD!,
      },
    });
    try {
      const info = await transporter.sendMail({
        from: process.env.NO_REPLY_EMAIL!,
        to: email,
        subject: "Şifre Sıfırlama",
        html: htmlTemplate(token, user.name),
      });
      if (!info) {
        return {
          success: false,
          message: "E-posta gönderilemedi. Lütfen tekrar deneyiniz.",
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "E-posta gönderimi sırasında bir hata oluştu.",
      };
    }
    return { success: true, message: "E-posta gönderilmiştir" };
  } catch (error) {
    return {
      success: false,
      message: "Bir hata oluştu.Lütfen tekrar deneyiniz.",
    };
  }
}

export async function resetPasswordCheck(
  token: string,
  data: PasswordCheckType,
): Promise<{ success: boolean; message: string }> {
  try {
    const reset = await prisma.passwordReset.findFirst({
      where: {
        token,
        used: false, // Kullanılmamış token kontrolü
        expiresAt: {
          gt: new Date(), // Süresi geçmemiş token kontrolü
        },
      },
      include: {
        user: true,
      },
    });
    if (!reset || !reset.user) {
      return {
        success: false,
        message: "Geçersiz ya da süresi dolmuş bağlantı.",
      };
    }

    const { confirmPassword, password } = passwordCheckSchema.parse(data);
    if (password !== confirmPassword) {
      return { success: false, message: "Şifreler eşleşmiyor" };
    }

    const hashedPassword = await hash(password, 10);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: reset.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordReset.update({
        where: { id: reset.id },
        data: { used: true },
      }),
    ]);
    return { success: true, message: "Şifreniz başarıyla değiştirildi" };
  } catch (error) {
    return {
      success: false,
      message: "Bir hata oluştu.Lütfen tekrar deneyiniz.",
    };
  }
}
const htmlTemplate = (token: string, name: string) => {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>Şifre Sıfırlama</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style type="text/css">
        body {
            background-color: #f6f6f6;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            -webkit-font-smoothing: antialiased;
            line-height: 1.4;
            margin: 0;
            padding: 0;
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 20px 0;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #000000;
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #666666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Şifre Sıfırlama</h1>
        </div>
        <div class="content">
            <p>Merhaba</p>
            <p>Şifre sıfırlama talebiniz alındı. Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
            <a href="${process.env.NEXT_PUBLIC_API_URL}/sifremi-unuttum/${token}" class="button">Şifremi Sıfırla</a>
            <p style="font-size: 14px; color: #666666;">Bu link 15 dakika boyunca geçerli olacaktır.</p>
            <p style="font-size: 14px;">Eğer bu talebi siz yapmadıysanız, lütfen bu emaili dikkate almayın.</p>
        </div>
        <div class="footer">
            <p>Bu otomatik bir emaildir, lütfen yanıtlamayın.</p>
            <p>&copy; 2024 TerraViva. Tüm hakları saklıdır.</p>
        </div>
    </div>
</body>
</html>`;
};
