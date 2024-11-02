import { auth } from "@/auth";

export async function isAdmin() {
  const session = await auth();
  if (!session) return false;
  if (session.user?.role === "ADMIN" || session.user?.role === "SUPERADMIN")
    return true;

  return false;
}
