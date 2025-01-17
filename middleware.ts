import { Role } from "@prisma/client";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { nextUrl, headers } = req;
  const login = !!req.auth;
  const isAdmin =
    req.auth?.user?.role === Role.SUPERADMIN ||
    req.auth?.user?.role === Role.ADMIN;
  const pathname = nextUrl.pathname;
  if (login) {
    if (
      pathname === "/sifremi-unuttum" ||
      pathname.startsWith("/sifremi-unuttum/")
    ) {
      return NextResponse.redirect(new URL("/", nextUrl.origin));
    }

    // Giriş sayfası kontrolü
    if (pathname.startsWith("/giris")) {
      return NextResponse.redirect(new URL("/", nextUrl.origin));
    }
  }
  if (!login && pathname.startsWith("/hesabim")) {
    return NextResponse.redirect(new URL("/giris", nextUrl.origin));
  }

  if (!isAdmin && nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.rewrite(new URL("/sayfa-bulunamadı", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)", "/"],
};
