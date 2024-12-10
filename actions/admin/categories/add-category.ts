"use server";

import { isAuthorized } from "@/lib/isAdminorSuperAdmin";
import { prisma } from "@/lib/prisma";
import { processImages } from "@/lib/recordImage";
import { slugify } from "@/utils/slugify";
import { AddCategorySchema } from "@/zodschemas/authschema";

export async function AddCategory(
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await isAuthorized();
    if (
      !session ||
      (session?.role !== "ADMIN" && session?.role !== "SUPERADMIN")
    ) {
      return { success: false, message: "Unauthorized" };
    }
    if (!formData) {
      return { success: false, message: "Form data is required" };
    }
    const data = {
      name: formData.get("name"),
      description: formData.get("description"),
      active: (formData.get("active") as string) === "true",
      imageFile: formData.getAll("imageFile"),
    };
    AddCategorySchema.parse(data);
    const slug = slugify(data.name as string);
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return { success: false, message: "Category already exists" };
    }
    const urls = [];
    try {
      if (data.imageFile.length > 0) {
        urls.push(await processImages(data.imageFile as File[]));
      }
    } catch (error) {
      return { success: false, message: error.message };
    }

    await prisma.$transaction(async (tx) => {
      const category = await tx.category.create({
        data: {
          name: data.name as string,
          slug,
          description: data.description as string,
          active: data.active,
          Image: {
            createMany: {
              data: urls[0].map((url) => ({ url: url.url })),
            },
          },
        },
      });

      return category;
    });

    return { success: true, message: "Category added successfully" };
  } catch (error) {
    console.log(error);
    return { success: false, message: error.message };
  }
}
