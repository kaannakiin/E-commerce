import { Role } from "@prisma/client";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "./auth.config";

const PROTECT_FOR_LOGIN_USERS = "/giris";
const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { nextUrl } = req;

  const login = !!req.auth;
  const isAdmin =
    req.auth?.user?.role === Role.SUPERADMIN ||
    req.auth?.user?.role === Role.ADMIN;

  // 5. Route yönlendirmeleri
  if (login && nextUrl.pathname.startsWith(PROTECT_FOR_LOGIN_USERS)) {
    return NextResponse.redirect(new URL("/hesabim", nextUrl.origin));
  }

  if (!login && nextUrl.pathname.startsWith("/hesabim")) {
    return NextResponse.redirect(
      new URL(PROTECT_FOR_LOGIN_USERS, nextUrl.origin),
    );
  }

  if (!isAdmin && nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.rewrite(new URL("/sayfa-bulunamadı", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)", "/"],
};

