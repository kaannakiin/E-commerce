import { auth } from "@/auth";
import { Role } from "@prisma/client";

interface AuthorizedUser {
  id: string;
  email: string | null;
  role: Role;
  name?: string | null;
}

export async function isAuthorized(): Promise<AuthorizedUser | false> {
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
}
