import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Role } from "@prisma/client";
import { compare } from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getUserByEmail, getUserById } from "./lib/getUser";
import { LoginSchema } from "./zodschemas/authschema";

export default {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const validatedFields = LoginSchema.safeParse(credentials);
        if (validatedFields.success) {
          const { email, password } = validatedFields.data;
          const user = await getUserByEmail(email);
          if (!user || !("password" in user)) return null;
          const passwordCheck = await compare(password, user.password);
          if (passwordCheck) return user;
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/giris",
  },
  callbacks: {
    async session({ session, token }) {
      session.user.emailVerified = token.emailVerified as boolean;

      if (token && session.user) {
        session.user.role = token.role as Role;
      }
      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;
      const user = await getUserById(token.sub);
      if (!user) {
        return token;
      }
      token.role = user.role;
      token.emailVerified = user.emailVerified;

      return token;
    },
  },
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;
