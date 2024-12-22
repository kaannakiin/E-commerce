"use server";

import { signIn } from "@/auth";
import { LoginSchema, LoginSchemaType } from "@/zodschemas/authschema";
import { AuthError } from "next-auth";
export const Login = async (
  data: LoginSchemaType,
): Promise<{ success: boolean; message: string }> => {
  try {
    const { email, password } = LoginSchema.parse(data);
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true, message: "Giriş başarılı" };
  } catch (error) {
    console.error("Login error:", error); // Hata loglaması ekleyelim

    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, message: "Kullanıcı adı veya şifre hatalı" };

        default:
          return { success: false, message: "Bir hata oluştu" };
      }
    }
    return { success: false, message: "Bir hata oluştu" };
  }
};
