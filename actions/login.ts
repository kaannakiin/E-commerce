"use server";

import { signIn } from "@/auth";
import { LoginSchema, LoginSchemaType } from "@/zodschemas/authschema";
import { AuthError } from "next-auth";
export const Login = async (data: LoginSchemaType, callbackUrl) => {
  try {
    const { email, password } = LoginSchema.parse(data);
    await signIn("credentials", {
      email,
      password,
      redirect: true,
      redirectTo: callbackUrl || "/",
    });
    return { success: "Giriş başarılı" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Kullanıcı adı veya şifre hatalı" };

        default:
          return { error: "Bir hata oluştu" };
      }
    }
    throw error;
  }
};
