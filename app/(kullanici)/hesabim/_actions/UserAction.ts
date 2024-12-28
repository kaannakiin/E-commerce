"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  UpdatePasswordSchema,
  UpdatePasswordType,
  updateUserInfo,
  UpdateUserInfoType,
} from "@/zodschemas/authschema";
import { revalidatePath } from "next/cache";

export async function UpdateUser(data: UpdateUserInfoType): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const session = await auth();
    if (!session) return { success: false, message: "Yetkisiz erişim" };
    const { email, name, phone, surname } = updateUserInfo.parse(data);
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });

    if (!currentUser) {
      return {
        success: false,
        message: "Kullanıcı bulunamadı",
      };
    }
    if (email !== currentUser.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (existingEmail) {
        return {
          success: false,
          message: "Bu işlem gerçekleştirilemiyor. Lütfen tekrar deneyiniz.",
        };
      }
    }
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        email,
        name,
        phone,
        surname,
      },
    });
    revalidatePath("/hesabim");

    return { success: true, message: "Kullanıcı bilgileriniz güncellendi" };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Bir hata oluştu" };
  }
}
export async function UpdatePassword(data: UpdatePasswordType): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const session = await auth();
    if (!session) return { success: false, message: "Yetkisiz erişim" };
    const { newPassword, newPasswordConfirm, oldPassword } =
      UpdatePasswordSchema.parse(data);
    if (newPassword === oldPassword) {
      return {
        success: false,
        message: "Yeni şifreniz eski şifrenizle aynı olamaz",
      };
    }
    if (newPassword !== newPasswordConfirm) {
      return {
        success: false,
        message: "Şifreler uyuşmuyor",
      };
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return {
        success: false,
        message: "Kullanıcı bulunamadı",
      };
    }
    const passwordCheck = await bcrypt.compare(oldPassword, user.password);
    if (!passwordCheck) {
      return {
        success: false,
        message: "Eski şifreniz yanlış",
      };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
      },
    });
    revalidatePath("/hesabim");
    return { success: true, message: "Şifreniz güncellendi" };
  } catch (error) {
    return { success: false, message: "Bir hata oluştu" };
  }
}
