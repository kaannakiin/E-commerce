import { Role } from "@prisma/client";
import { type DefaultSession } from "next-auth";
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
      emailVerified: boolean | null;
    };
  }
}
