"use server";

import { isAuthorized } from "@/lib/isAdminorSuperAdmin";
import { prisma } from "@/lib/prisma";
import { IdForEverythingType } from "@/zodschemas/authschema";
import { Role } from "@prisma/client";

interface UserUpdateRoleProps {
  id: IdForEverythingType;
  newRole: Role;
}
export async function UserUpdateRole({
  id,
  newRole,
}: UserUpdateRoleProps): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const session = await isAuthorized();
    if (!session) return { success: false, message: "Yetkiniz yok" };
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return { success: false, message: "Kullanıcı bulunamadı" };
    if (session.role !== "SUPERADMIN") {
      return { success: false, message: "Yetkiniz yok" };
    }
    if (
      (newRole === "ADMIN" || newRole === "USER") &&
      session.role === "SUPERADMIN"
    ) {
      const superAdminRole = await prisma.user.count({
        where: { role: "SUPERADMIN" },
      });
      if (superAdminRole === 1) {
        return {
          success: false,
          message: "Süper yöneticiyi değiştiremezsiniz.",
        };
      }
    }
    if (user.id === session.id) {
      return { success: false, message: "Kendi rolünüzü değiştiremezsiniz" };
    }
    await prisma.user.update({
      where: { id },
      data: { role: newRole },
    });
    return { success: true, message: "Rol güncellendi" };
  } catch (error) {
    return { success: false, message: "Bir hata oluştu" };
  }
}
