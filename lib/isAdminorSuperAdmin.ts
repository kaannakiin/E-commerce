import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { cache } from "react";

interface AuthorizedUser {
  id: string;
  email: string | null;
  role: Role;
  name?: string | null;
}

export const isAuthorized = cache(async (): Promise<AuthorizedUser | false> => {
  const session = await auth();
  if (!session?.user?.role) {
    return false;
  }
  if (session.user.role === "ADMIN" || session.user.role === "SUPERADMIN") {
    return {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
    };
  }
  return false;
});
