"use server";

import { getUserByEmail } from "@/lib/getUser";
import { prisma } from "@/lib/prisma";
import { RegisterSchema, RegisterSchemaType } from "@/zodschemas/authschema";
import { hash } from "bcryptjs";
import { ZodError } from "zod";

export const Register = async (data: RegisterSchemaType) => {
  try {
    const { email, surname, name, password, confirmPassword, phone } =
      RegisterSchema.parse(data);

    const user = await getUserByEmail(email);
    if (user) {
      return {
        error: "Girdiğiniz mail zaten kullanılıyor. Lütfen giriş yapınız.",
      };
    }

    if (password !== confirmPassword) {
      return { error: "Şifreler eşleşmiyor" };
    }

    const hashedPassword = await hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        name,
        surname,
        password: hashedPassword,
        ...(phone && { phone }),
      },
    });

    return { success: "Kayıt işlemi başarılı yönlendiriliyorsunuz." };
  } catch (error) {
    if (error instanceof ZodError) {
      return { error: error.errors };
    }
    return { error: error };
  }
};
