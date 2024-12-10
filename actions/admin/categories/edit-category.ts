"use server";
import { isAuthorized } from "@/lib/isAdminorSuperAdmin";
import { prisma } from "@/lib/prisma";
import { RecordImgToAsset } from "@/lib/recordImage";
import { EditCategorySchema } from "@/zodschemas/authschema";

export async function EditCategoryBySlug(
  formData: FormData,
  slug: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    const session = await isAuthorized();
    if (
      !session ||
      (session?.role !== "ADMIN" && session?.role !== "SUPERADMIN")
    ) {
      return { success: false, message: "Unauthorized" };
    }
    const data = {
      name: formData.get("name"),
      description: formData.get("description"),
      active: (formData.get("active") as string) === "true",
      imageFile: formData.getAll("imageFile"),
    };

    EditCategorySchema.parse(data);
    const urls = [];
    try {
      if (data.imageFile.length > 0) {
        urls.push(await RecordImgToAsset(data.imageFile as File[]));
      }
    } catch (error) {
      return { success: false, message: "Resim yüklenirken bir hata oluştu" };
    }
    const result = await prisma.$transaction(async (tx) => {
      const existingCategory = await tx.category.findUnique({
        where: { slug },
      });

      if (!existingCategory) {
        throw new Error("Category not found");
      }

      if (urls.length > 0) {
        await tx.category.update({
          where: { slug },
          data: {
            name: data.name as string,
            description: data.description as string,
            active: data.active,
            Image: {
              createMany: {
                data: urls[0].map((url) => ({ url: url.url })),
              },
            },
          },
        });
      } else {
        await tx.category.update({
          where: { slug },
          data: {
            name: data.name as string,
            description: data.description as string,
            active: data.active,
          },
        });
      }
      return { success: true, message: "Güncellendi" };
    });
    return result;
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, message: "Hata" };
    }
    return { success: false, message: "Beklenmedik bir hata oluştu" };
  }
}
