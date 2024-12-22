import { Role } from "@prisma/client";
import { type DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
export type ExtendedUser = DefaultSession["user"] & {
  role: Role;
  emailVerified: boolean;
};
declare module "next-auth" {
  interface Session {
    user: {
      name: string | null;
      id: string;
      email: string;
      role: Role;
      emailVerified: Date | null; // boolean yerine Date | null
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    emailVerified?: Date | null; // boolean yerine Date | null
    name?: string | null;
    email?: string | null;
    sub?: string;
  }
}
