import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
const PROTECT_FOR_LOGIN_USERS = "/giris";
const { auth } = NextAuth(authConfig);
export default auth((req) => {
  const { nextUrl } = req;
  const login = !!req.auth;
  const isAdmin =
    req.auth?.user?.role === Role.SUPERADMIN ||
    req.auth?.user?.role === Role.ADMIN;
  if (login) {
    if (nextUrl.pathname.startsWith(PROTECT_FOR_LOGIN_USERS)) {
      return NextResponse.redirect("/");
    }
  }
  if (!login && nextUrl.pathname.startsWith("/hesabim")) {
    return NextResponse.redirect("/giris");
  }
  if (!isAdmin) {
    if (nextUrl.pathname.startsWith("/admin")) {
      return NextResponse.rewrite(new URL("/sayfa-bulunamadı", nextUrl.origin));
    }
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)", "/"],
};
