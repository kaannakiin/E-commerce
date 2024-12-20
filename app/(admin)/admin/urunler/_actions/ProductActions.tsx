"use server";
import { DeleteImage } from "@/lib/deleteImageFile";
import { isAuthorized } from "@/lib/isAdminorSuperAdmin";
import { prisma } from "@/lib/prisma";
import { processImages } from "@/lib/recordImage";
import { variantSlugify } from "@/utils/SlugifyVariants";
import {
  IdForEverythingTypeUuid,
  ProductAddFormValues,
  ProductAddSchema,
} from "@/zodschemas/authschema";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

// export async function AddProduct(data: ProductAddFormValues) {
//   try {
//     const session = await isAuthorized();
//     if (!session) {
//       return { success: false, message: "Yetkisiz işlem" };
//     }
//     const { variants } = ProductAddSchema.parse(data);
//     const createdFiles: string[] = [];

//     try {
//       return await prisma.$transaction(
//         async (tx) => {
//           const firstCategoryName = await tx.category.findUnique({
//             where: { id: data.categories[0] },
//             select: {
//               name: true,
//             },
//           });
//           if (!firstCategoryName) {
//             throw new Error("Kategori bulunamadı");
//           }

//           await tx.product.create({
//             data: {
//               name: data.name,
//               description: data.description,
//               shortDescription: data.shortDescription,
//               googleCategoryId: Number(data.googleCategories),
//               active: data.active,
//               categories: {
//                 connect: data.categories.map((category) => ({ id: category })),
//               },
//               type: data.productType,
//               taxRate: data.taxPrice,
//               Variant: {
//                 create: await Promise.all(
//                   variants.map(async (variant) => {
//                     let variantValue = variant.value;
//                     let variantUnit = variant.unit;

//                     if (variant.type === "WEIGHT") {
//                       variantValue = variant.weightValue?.toString() || "0";
//                       variantUnit = variant.unit || "G";
//                     }

//                     // Process images once for the variant
//                     const processedImages = await processImages(
//                       variant.imageFiles,
//                       {
//                         quality: 80,
//                         maxWidth: 1920,
//                         maxHeight: 1920,
//                         format: "webp",
//                       },
//                     );

//                     const variantSlug = variantSlugify({
//                       productName: data.name,
//                       type: variant.type as VariantType,
//                       value: variantValue,
//                       unit: variant.type === "WEIGHT" ? variantUnit : undefined,
//                     });

//                     return {
//                       value: variantValue,
//                       unit: variant.type === "WEIGHT" ? variantUnit : null,
//                       type: variant.type,
//                       price: variant.price,
//                       isSpotlightFeatured: variant.isSpotLight,
//                       discount: variant.discount,
//                       isPublished: variant.active,
//                       stock: variant.stock,
//                       slug: variantSlug,
//                       seoTitle: variant.pageTitle,
//                       seoDescription: variant.metaDescription,
//                       richTextDescription: variant.richTextDescription,
//                       Image: {
//                         createMany: {
//                           data: processedImages.map((img) => ({
//                             url: img.url,
//                           })),
//                         },
//                       },
//                     };
//                   }),
//                 ),
//               },
//             },
//             include: {
//               Variant: {
//                 include: {
//                   Image: true,
//                 },
//               },
//             },
//           });

//           return { success: true, message: "Ürün başarıyla eklendi" };
//         },
//         {
//           timeout: 20000,
//         },
//       );
//     } catch (error) {
//       console.log(error);
//       await cleanupFiles(createdFiles);
//       if (error?.code === "P2002" && error?.meta?.target?.includes("slug")) {
//         return {
//           success: false,
//           message:
//             "Bu ürün ve varyant kombinasyonu zaten mevcut. Lütfen farklı bir ürün adı veya varyant değeri kullanın.",
//         };
//       }
//       throw error;
//     }
//   } catch (error) {
//     console.log(error);
//     return {
//       success: false,
//       message: "Ürün oluşturulurken bir hata oluştu",
//     };
//   }
// }
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
      const deleteResult = await DeleteImage(imageUrl);
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
                        canonicalUrl: firstCategory.slug + "/" + variantSlug,
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
                  canonicalUrl: firstCategory.slug + "/" + variantSlug,
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
