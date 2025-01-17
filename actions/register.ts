"use server";
import { headers } from "next/headers";
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
    const headersList = await headers();
    const ip =
      headersList.get("x-real-ip") || headersList.get("x-forwarded-for");
    const locationResponse = await fetch(
      `https://ip-api.com/json/${ip}?fields=49169`,
    );
    const locationInfo: {
      status: "success" | "fail";
      country: string;
      city: string;
    } = await locationResponse.json();
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        name,
        surname,
        password: hashedPassword,
        ...(phone && { phone }),
        ...(locationInfo.status === "success" && {
          country: locationInfo.country,
          city: locationInfo.city,
        }),
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
