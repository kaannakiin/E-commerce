"use server";
import { auth } from "@/auth";
import { DeleteImageToAsset } from "@/lib/deleteImageFile";
import { isAuthorized } from "@/lib/isAdminorSuperAdmin";
import { prisma } from "@/lib/prisma";
import { processImages } from "@/lib/recordImage";
import { variantSlugify } from "@/utils/SlugifyVariants";
import {
  IdForEverythingType,
  IdForEverythingTypeUuid,
  ProductAddFormValues,
  ProductAddSchema,
} from "@/zodschemas/authschema";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
export async function AddProduct(data: ProductAddFormValues) {
  try {
    // Yetkilendirme kontrolü
    const session = await isAuthorized();
    if (!session) {
      return { success: false, message: "Yetkisiz işlem" };
    }

    // Veri doğrulama
    try {
      ProductAddSchema.parse(data);
    } catch (error) {
      return { success: false, message: "Geçersiz ürün verisi" };
    }

    // Kategori kontrolü
    const firstCategory = await prisma.category.findFirst({
      where: {
        id: data.categories[0],
      },
    });

    if (!firstCategory) {
      return { success: false, message: "Kategori bulunamadı" };
    }

    // Transaction işlemi
    return await prisma.$transaction(
      async (tx) => {
        // Ürün adı kontrolü
        const existingProduct = await tx.product.findFirst({
          where: {
            name: {
              equals: data.name,
              mode: "insensitive",
            },
          },
        });

        if (existingProduct) {
          return { success: false, message: "Bu ürün adı zaten kullanılıyor" };
        }

        await tx.product.create({
          data: {
            name: data.name,
            taxRate: data.taxPrice,
            description: data.description,
            shortDescription: data.shortDescription,
            googleCategoryId: Number(data.googleCategories),
            active: data.active,
            type: data.productType,
            categories: {
              connect: data.categories.map((category) => ({ id: category })),
            },
            Variant: {
              create: await Promise.all(
                data.variants.map(async (variant) => {
                  const variantSlug = variantSlugify({
                    productName: data.name,
                    type: variant.type,
                    value: variant.value.toString(),
                    unit: variant.unit,
                  });

                  const urls = [];
                  if (variant.imageFiles.length > 0) {
                    await processImages(variant.imageFiles, {
                      quality: 80,
                      maxWidth: 1920,
                      maxHeight: 1920,
                      format: "webp",
                    }).then((images) => {
                      images.forEach((img) => {
                        urls.push(img.url);
                      });
                    });
                  }

                  return {
                    value: variant.value.toString(),
                    unit: variant.type === "WEIGHT" ? variant.unit : null,
                    type: variant.type,
                    price: variant.price,
                    isSpotlightFeatured: variant.isSpotLight,
                    discount: variant.discount,
                    isPublished: variant.active,
                    stock: variant.stock,
                    slug: variantSlug,
                    seoTitle: variant.pageTitle,
                    seoDescription: variant.metaDescription,
                    richTextDescription: variant.richTextDescription,
                    canonicalUrl: variantSlug,
                    ...(urls.length > 0 && {
                      Image: {
                        createMany: {
                          data: urls.map((url) => ({ url })),
                          skipDuplicates: true,
                        },
                      },
                    }),
                  };
                }),
              ),
            },
          },
        });

        return { success: true, message: "Ürün başarıyla oluşturuldu" };
      },
      { timeout: 50000 },
    );
  } catch (error) {
    console.error("AddProduct error:", error);
    return { success: false, message: "Ürün oluşturulurken bir hata oluştu" };
  }
}
export async function searchGoogleCategories(searchTerm: string) {
  try {
    const session = await isAuthorized();
    if (!session) {
      return { success: false, message: "Yetkisiz işlem" };
    }
    const results = await prisma.googleCategory.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { fullPath: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        level: true,
        fullPath: true,
        parentPath: true,
        breadcrumbs: true,
      },
      take: 50,
    });

    return { success: true, data: results };
  } catch (error) {
    console.error("Search error:", error);
    return { success: false, error: "Arama yapılırken bir hata oluştu" };
  }
}
export async function getGoogleCategories() {
  try {
    const session = await isAuthorized();
    if (!session) {
      return { success: false, message: "Yetkisiz işlem" };
    }
    const results = await prisma.googleCategory.findMany({
      where: {
        level: 1,
      },
      select: {
        id: true,
        name: true,
        level: true,
        fullPath: true,
        parentPath: true,
        breadcrumbs: true,
      },
      take: 50,
    });

    return { success: true, data: results };
  } catch (error) {
    console.error("Search error:", error);
    return { success: false, error: "Arama yapılırken bir hata oluştu" };
  }
}
export async function DeleteAsset(
  imageUrl: string,
  variantId: string,
): Promise<{ success: boolean; message: string; imageUrl?: string }> {
  try {
    // Yetki kontrolü
    const session = await isAuthorized();
    if (!session) {
      return { success: false, message: "Yetkisiz işlem" };
    }

    // Parametre kontrolü
    if (!variantId || !imageUrl) {
      return { success: false, message: "Geçersiz parametreler" };
    }

    // Transaction işlemi
    const result = await prisma.$transaction(async (tx) => {
      // Resmin varlığını kontrol et
      const image = await tx.image.findUnique({
        where: { url: imageUrl },
      });

      if (!image) {
        return { success: false, message: "Resim bulunamadı" };
      }
      const deleteResult = await DeleteImageToAsset(imageUrl);
      if (!deleteResult.success) {
        return {
          success: false,
          message: "Depolama alanından resim silinemedi",
        };
      }

      await tx.image.delete({
        where: { url: imageUrl },
      });

      return {
        success: true,
        message: "Resim başarıyla silindi",
        imageUrl: imageUrl,
      };
    });

    return result;
  } catch (error) {
    console.error("DeleteAsset error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu",
    };
  }
}
export async function EditProduct(
  data: ProductAddFormValues,
  id: IdForEverythingTypeUuid,
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const session = await isAuthorized();
    if (!session) {
      return { success: false, message: "Yetkisiz işlem" };
    }
    ProductAddSchema.parse(data);
    const product = await prisma.product.findUnique({
      where: { id },
      include: { Variant: true },
    });
    const firstCategory = await prisma.category.findFirst({
      where: {
        id: data.categories[0],
      },
      select: {
        slug: true,
      },
    });
    if (!product || !firstCategory) {
      return { success: false, message: "Ürün bulunamadı" };
    }
    const existingVariantIds = product.Variant.map((v) => v.id);
    const variantsToUpdate = data.variants.filter((v) =>
      existingVariantIds.includes(v.uniqueId),
    );
    const variantsToCreate = data.variants.filter(
      (v) => !existingVariantIds.includes(v.uniqueId),
    );
    const variantIdsToDelete = existingVariantIds.filter(
      (existingId) => !data.variants.some((v) => v.uniqueId === existingId),
    );

    return await prisma.$transaction(
      async (tx) => {
        if (
          variantIdsToDelete.length < 0 ||
          variantsToUpdate.length < 0 ||
          variantsToCreate.length < 0
        ) {
          return { success: false, message: "Geçersiz parametreler" };
        }
        if (variantsToUpdate.length > 0) {
          await tx.product.update({
            where: { id },
            data: {
              name: data.name,
              description: data.description,
              shortDescription: data.shortDescription,
              googleCategoryId: Number(data.googleCategories),
              active: data.active,
              categories: {
                set: [],
                connect: data.categories.map((category) => ({ id: category })),
              },
              type: data.productType,
              taxRate: data.taxPrice,
              Variant: {
                update: await Promise.all(
                  variantsToUpdate.map(async (variant) => {
                    const variantSlug = variantSlugify({
                      productName: data.name,
                      type: variant.type,
                      value: variant.value.toString(),
                      unit: variant.unit,
                    });
                    const urls = [];
                    if (variant.imageFiles.length > 0) {
                      await processImages(variant.imageFiles, {
                        quality: 80,
                        maxWidth: 1920,
                        maxHeight: 1920,
                        format: "webp",
                      }).then((images) => {
                        images.forEach((img) => {
                          urls.push(img.url);
                        });
                      });
                    }
                    return {
                      where: { id: variant.uniqueId },
                      data: {
                        value: variant.value.toString(),
                        unit: variant.type === "WEIGHT" ? variant.unit : null,
                        type: variant.type,
                        price: variant.price,
                        isSpotlightFeatured: variant.isSpotLight,
                        discount: variant.discount,
                        isPublished: variant.active,
                        stock: variant.stock,
                        slug: variantSlug,
                        seoTitle: variant.pageTitle,
                        seoDescription: variant.metaDescription,
                        richTextDescription: variant.richTextDescription,
                        canonicalUrl: variantSlug,
                        Image: {
                          createMany: {
                            data: urls.map((url) => ({ url })),
                            skipDuplicates: true,
                          },
                        },
                      },
                    };
                  }),
                ),
              },
            },
          });
        }
        if (variantIdsToDelete.length > 0) {
          await tx.variant.updateMany({
            where: { id: { in: variantIdsToDelete } },
            data: { softDelete: true },
          });
        }
        if (variantsToCreate.length > 0) {
          await tx.variant.createMany({
            data: await Promise.all(
              variantsToCreate.map(async (variant) => {
                const variantSlug = variantSlugify({
                  productName: data.name,
                  type: variant.type,
                  value: variant.value.toString(),
                  unit: variant.unit,
                });
                const urls = [];
                if (variant.imageFiles.length > 0) {
                  await processImages(variant.imageFiles, {
                    quality: 80,
                    maxWidth: 1920,
                    maxHeight: 1920,
                    format: "webp",
                  }).then((images) => {
                    images.forEach((img) => {
                      urls.push(img.url);
                    });
                  });
                }
                return {
                  value: variant.value.toString(),
                  unit: variant.type === "WEIGHT" ? variant.unit : null,
                  type: variant.type,
                  price: variant.price,
                  isSpotlightFeatured: variant.isSpotLight,
                  discount: variant.discount,
                  isPublished: variant.active,
                  stock: variant.stock,
                  slug: variantSlug,
                  seoTitle: variant.pageTitle,
                  seoDescription: variant.metaDescription,
                  richTextDescription: variant.richTextDescription,
                  canonicalUrl: variantSlug,
                  productId: id,
                  Image: {
                    createMany: {
                      data: urls.map((url) => ({ url })),
                      skipDuplicates: true,
                    },
                  },
                };
              }),
            ),
          });
        }
        return { success: true, message: "Ürün başarıyla güncellendi" };
      },
      { timeout: 100000 },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        success: false,
        message: "Veritabanı işlemi sırasında hata oluştu",
      };
    } else if (error instanceof ZodError) {
      return {
        success: false,
        message: "Geçersiz ürün bilgileri",
      };
    }
    return {
      success: false,
      message: "Ürün güncellenirken bir hata oluştu",
    };
  }
}
export async function AddFavorite(
  id: IdForEverythingType,
): Promise<{ success: boolean; message: string; isMustLogin?: boolean }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "Giriş yapmalısınız",
        isMustLogin: true,
      };
    }

    const variant = await prisma.variant.findUnique({
      where: { id, softDelete: false },
    });
    if (!variant) {
      return {
        success: false,
        message: "Ürün bulunamadı",
      };
    }
    const existingFavorite = await prisma.favoriteVariants.findUnique({
      where: {
        userId_variantId: {
          userId: session.user.id,
          variantId: id,
        },
      },
    });
    if (existingFavorite) {
      await prisma.favoriteVariants.update({
        where: {
          id: existingFavorite.id,
        },
        data: {
          deletedAt: existingFavorite.deletedAt ? null : new Date(),
        },
      });
      revalidatePath("/hesabim/favoriler");
      return {
        success: true,
        message: existingFavorite.deletedAt
          ? "Favorilere eklendi"
          : "Favorilerden çıkarıldı",
      };
    }

    await prisma.favoriteVariants.create({
      data: {
        userId: session.user.id,
        variantId: id,
      },
    });

    return {
      success: true,
      message: "Ürün favorilere eklendi",
    };
  } catch (error) {
    console.error("AddFavorite error:", error);
    return {
      success: false,
      message: "Bir hata oluştu",
    };
  }
}
