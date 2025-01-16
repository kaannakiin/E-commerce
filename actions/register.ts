"use server";

import { getUserByEmail } from "@/lib/getUser";
import { prisma } from "@/lib/prisma";
import { RegisterSchema, RegisterSchemaType } from "@/zodschemas/authschema";
import bcrypt from "bcryptjs";
import { ZodError } from "zod";
import { SendWelcomeEmail } from "./sendMailAction/SendMail";

export const Register = async (data: RegisterSchemaType) => {
  try {
    const { email, surname, name, password, confirmPassword, phone } =
      RegisterSchema.parse(data);

    const user = await getUserByEmail(email, phone);
    if (user) {
      return {
        error: "Girdiğiniz mail zaten kullanılıyor. Lütfen giriş yapınız.",
      };
    }

    if (password !== confirmPassword) {
      return { error: "Şifreler eşleşmiyor" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        name,
        surname,
        password: hashedPassword,
        ...(phone && { phone }),
      },
    });
    const senderEmail = await SendWelcomeEmail({ toEmail: email });
    return { success: "Kayıt işlemi başarılı yönlendiriliyorsunuz." };
  } catch (error) {
    if (error instanceof ZodError) {
      return { error: error.errors };
    }
    return { error: error };
  }
};
