"use server";

import { isAuthorized } from "@/lib/isAdminorSuperAdmin";
import { prisma } from "@/lib/prisma";
import {
  IdForEverythingType,
  policyFormSchema,
  PolicyFormValues,
} from "@/zodschemas/authschema";
import { ECommerceAgreements, Prisma } from "@prisma/client";

export async function PoliciesEdit(
  data: PolicyFormValues,
  id?: IdForEverythingType,
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const session = isAuthorized();
    if (!session) return { success: false, message: "Yetkisiz Erişim" };

    // Veri doğrulama
    policyFormSchema.parse(data);

    // Düzenleme işlemi
    if (id) {
      // Mevcut policy'i kontrol et
      const existingPolicy = await prisma.policies.findUnique({
        where: { id },
      });

      if (!existingPolicy) {
        return { success: false, message: "Sözleşme bulunamadı" };
      }

      // Type hariç güncelleme
      await prisma.policies.update({
        where: { id },
        data: {
          title: data.policyTitle,
          content: data.policyTemplate,
        },
      });
      return { success: true, message: "Sözleşme Güncellendi" };
    } else {
      const typeExists = await prisma.policies.findUnique({
        where: { type: data.policyType as ECommerceAgreements },
      });

      if (typeExists) {
        return { success: false, message: "Bu tür sözleşme zaten mevcut" };
      }
      await prisma.policies.create({
        data: {
          type: data.policyType as ECommerceAgreements,
          title: data.policyTitle,
          content: data.policyTemplate,
        },
      });
      return { success: true, message: "Sözleşme Oluşturuldu" };
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { success: false, message: "Bu tür sözleşme zaten mevcut" };
      }
    }
    console.error("Policies Edit Error:", error);
    return { success: false, message: "Bir Hata Oluştu" };
  }
}
export async function deletePolicy(id: IdForEverythingType): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const session = isAuthorized();
    if (!session) return { success: false, message: "Yetkisiz Erişim" };
    await prisma.policies.delete({
      where: { id },
    });

    return { success: true, message: "Sözleşme Silindi" };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return { success: false, message: "Sözleşme Bulunamadı" };
      }
    }

    console.error("Policy Delete Error:", error);
    return { success: false, message: "Bir Hata Oluştu" };
  }
}
