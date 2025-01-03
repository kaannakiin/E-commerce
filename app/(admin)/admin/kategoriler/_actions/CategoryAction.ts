"use server";

import { DeleteImageToAsset } from "@/lib/deleteImageFile";
import { isAuthorized } from "@/lib/isAdminorSuperAdmin";
import { prisma } from "@/lib/prisma";
import { processImages } from "@/lib/recordImage";
import { generateCategoryJsonLd } from "@/utils/generateJsonLD";
import { slugify } from "@/utils/SlugifyVariants";
import {
  CategoryEditableFormValues,
  CategoryEditableSchema,
} from "@/zodschemas/authschema";
import { Prisma } from "@prisma/client";

export async function CreateCategoryDB(
  data: CategoryEditableFormValues,
): Promise<{ success: boolean; message: string }> {
  try {
    const session = isAuthorized();
    if (!session) {
      return { success: false, message: "Yetkisiz İşlem" };
    }
    const {
      active,
      description,
      googleCategories,
      imageFiles,
      metaDescription,
      metaKeywords,
      metaTitle,
      name,
    } = CategoryEditableSchema.parse(data);
    const categorySlug = slugify(name);
    const categoryFound = await prisma.category.findUnique({
      where: {
        slug: categorySlug,
      },
    });

    if (categoryFound) {
      return { success: false, message: "Kategori Zaten Var" };
    }

    if (imageFiles.length !== 1) {
      return { success: false, message: "Lütfen 1 adet resim yükleyin" };
    }

    const urls: string[] = [];
    try {
      const processedImages = await processImages(imageFiles);
      urls.push(processedImages[0].url);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return { success: false, message: "Veritabanı işlemi başarısız" };
      }
      console.error("İşlem hatası:", error);
      return { success: false, message: "İşlem başarısız" };
    }

    const result = await prisma.$transaction(async (tx) => {
      const category = await tx.category.create({
        data: {
          name,
          active,
          description,
          metaTitle,
          metaDescription,
          metaKeywords,
          slug: categorySlug,
          googleCategoryId: Number(googleCategories),
          images: {
            create: urls.map((url) => ({
              url,
            })),
          },
        },
        include: {
          products: {
            include: {
              Variant: {
                where: {
                  softDelete: false,
                  isPublished: true,
                },
                include: {
                  Image: true,
                },
              },
              GoogleCategory: true,
            },
          },
          googleCategory: {
            include: {
              parent: true,
              children: true,
            },
          },
          images: true,
        },
      });
      const parentCategories =
        category.googleCategory?.breadcrumbs.map((name) => ({
          name,
          fullPath: category.googleCategory?.breadcrumbs
            .slice(0, category.googleCategory?.breadcrumbs.indexOf(name) + 1)
            .join(" > "),
        })) || [];

      const childCategories = category.googleCategory?.children || [];

      const jsonLd = generateCategoryJsonLd({
        category,
        products: category.products,
        parentCategories,
        childCategories,
      });

      await tx.category.update({
        where: { id: category.id },
        data: {
          JSONLD: jsonLd,
        },
      });
      return category;
    });

    return { success: true, message: "Kategori Oluşturuldu" };
  } catch (error) {
    console.error("Category creation error:", error);
    return { success: false, message: "Kategori Oluşturulamadı" };
  }
}
export async function UpdateCategoryDB(
  data: CategoryEditableFormValues,
  slug: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await isAuthorized();
    if (!session) {
      return { success: false, message: "Yetkisiz İşlem" };
    }
    const {
      active,
      description,
      googleCategories,
      imageFiles,
      metaDescription,
      metaKeywords,
      metaTitle,
      name,
    } = CategoryEditableSchema.parse(data);
    const categorySlug = slugify(name);
    const findCategory = await prisma.category.findUnique({
      where: { slug: categorySlug, NOT: { slug: slug } },
    });
    if (findCategory) {
      return {
        success: false,
        message:
          "Bu ada sahip kategori mevcuttur. Lütfen Başka bir isimle tekrar deneyin.",
      };
    }
    const result = await prisma.$transaction(
      async (tx) => {
        const updatedCategory = await tx.category.update({
          where: { slug },
          data: {
            active,
            description,
            slug: categorySlug,
            name,
            metaTitle,
            metaDescription,
            metaKeywords,
            googleCategoryId: Number(googleCategories),
          },
          include: {
            products: {
              include: {
                Variant: {
                  where: {
                    softDelete: false,
                    isPublished: true,
                  },
                  include: {
                    Image: true,
                  },
                },
                GoogleCategory: true,
              },
            },
            googleCategory: {
              include: {
                parent: true,
                children: true,
              },
            },
            images: true,
          },
        });
        const parentCategories =
          updatedCategory.googleCategory?.breadcrumbs.map((name) => ({
            name,
            fullPath: updatedCategory.googleCategory?.breadcrumbs
              .slice(
                0,
                updatedCategory.googleCategory?.breadcrumbs.indexOf(name) + 1,
              )
              .join(" > "),
          })) || [];

        const childCategories = updatedCategory.googleCategory?.children || [];

        const jsonLd = generateCategoryJsonLd({
          category: updatedCategory,
          products: updatedCategory.products,
          parentCategories,
          childCategories,
        });
        if (updatedCategory.images.length === 0) {
          await processImages(imageFiles).then(async (processedImages) => {
            await tx.category.update({
              where: { id: updatedCategory.id },
              data: {
                JSONLD: jsonLd,
                images: {
                  create: processedImages.map((image) => ({
                    url: image.url,
                  })),
                },
              },
            });
          });
        } else {
          await tx.category.update({
            where: { id: updatedCategory.id },
            data: {
              JSONLD: jsonLd,
            },
          });
        }

        return updatedCategory;
      },
      { timeout: 20000 },
    );
    return { success: true, message: "Kategori Güncellendi" };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return { success: false, message: "Veritabanı işlemi başarısız" };
    }
    console.error("İşlem hatası:", error);
    return { success: false, message: "İşlem başarısız" };
  }
}
export async function DeleteImageOnCategory(
  url: string,
  slug: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await isAuthorized();
    if (!session) {
      return { success: false, message: "Yetkisiz İşlem" };
    }

    const result = await prisma.$transaction(async (tx) => {
      const category = await tx.category.findUnique({
        where: { slug },
        include: { images: true },
      });

      if (!category) {
        throw new Error("Kategori bulunamadı");
      }

      await tx.image.deleteMany({
        where: {
          categoryId: category.id,
          url: url,
        },
      });
      const deleteimageres = await DeleteImageToAsset(url);
      if (!deleteimageres.success) {
        throw new Error(deleteimageres.message);
      }
      const updatedCategory = await tx.category.findUnique({
        where: { id: category.id },
        include: {
          products: {
            include: {
              Variant: {
                where: {
                  softDelete: false,
                  isPublished: true,
                },
                include: {
                  Image: true,
                },
              },
              GoogleCategory: true,
            },
          },
          googleCategory: {
            include: {
              parent: true,
              children: true,
            },
          },
          images: true,
        },
      });

      const parentCategories =
        updatedCategory.googleCategory?.breadcrumbs.map((name) => ({
          name,
          fullPath: updatedCategory.googleCategory?.breadcrumbs
            .slice(
              0,
              updatedCategory.googleCategory?.breadcrumbs.indexOf(name) + 1,
            )
            .join(" > "),
        })) || [];

      const childCategories = updatedCategory.googleCategory?.children || [];

      const jsonLd = generateCategoryJsonLd({
        category: updatedCategory,
        products: updatedCategory.products,
        parentCategories,
        childCategories,
      });

      await tx.category.update({
        where: { id: category.id },
        data: {
          JSONLD: jsonLd,
        },
      });

      return updatedCategory;
    });

    return { success: true, message: "Resim başarıyla silindi" };
  } catch (error) {
    console.error("Resim silme hatası:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Resim silinirken bir hata oluştu",
    };
  }
}
