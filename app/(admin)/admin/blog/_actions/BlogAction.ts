"use server";

import { DeleteImageToAsset } from "@/lib/deleteImageFile";
import { isAuthorized } from "@/lib/isAdminorSuperAdmin";
import { prisma } from "@/lib/prisma";
import { processImages } from "@/lib/recordImage";
import { slugify } from "@/utils/SlugifyVariants";
import fs from "fs/promises"; // fs modülünü kullanabilmek için
import path from "path";

import {
  BlogPostFormValues,
  BlogPostSchema,
  IdForEverythingType,
} from "@/zodschemas/authschema";
export async function BlogEdit(
  data: BlogPostFormValues,
  id: IdForEverythingType | null,
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const session = await isAuthorized();
    if (!session) return { success: false, message: "Yetkisiz Erişim." };
    const {
      active,
      authorName,
      authorSurname,
      blog,
      blogDescription,
      blogTitle,
      imageFile,
      pageDescription,
      pageTitle,
    } = BlogPostSchema.parse(data);

    if (id === null) {
      const imageUrl = [];
      try {
        await processImages(imageFile).then((res) => {
          imageUrl.push(res[0].url);
        });
      } catch (error) {
        return { success: false, message: "Resim yüklenirken hata oluştu." };
      }

      try {
      } catch (error) {}
      await prisma.blog.create({
        data: {
          author: authorName + " " + authorSurname,
          blogDescription,
          blogTitle,
          image: {
            create: {
              url: imageUrl[0],
            },
          },
          pageDescription,
          pageTitle,
          slug: slugify(pageTitle),
          Html: blog,
          active,
        },
      });
      return { success: true, message: "Blog başarıyla oluşturuldu." };
    } else {
      const post = await prisma.blog.findUnique({
        where: {
          id,
        },
        include: {
          image: true,
        },
      });
      try {
        if (post.image) {
          await DeleteImageToAsset(post.image.url);
        }
      } catch (error) {
        return { success: false, message: "Resim silinirken hata oluştu." };
      }
      const imageUrl = [];
      if (imageFile) {
        try {
          await processImages(imageFile).then((res) => {
            imageUrl.push(res[0].url);
          });
        } catch (error) {
          return { success: false, message: "Resim yüklenirken hata oluştu." };
        }
      }

      await prisma.blog.update({
        where: { id },
        data: {
          active,
          author: authorName + " " + authorSurname,
          blogDescription,
          blogTitle,
          image: imageFile ? { create: { url: imageUrl[0] } } : undefined,
          pageDescription,
          pageTitle,
          slug: slugify(pageTitle),
          Html: blog,
        },
      });
      return { success: true, message: "Blog başarıyla güncellendi." };
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: "Bir hata oluştu." };
  }
}
export async function BlogDelete(id: IdForEverythingType): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const session = await isAuthorized();
    if (!session) {
      return { success: false, message: "Yetkisiz erişim" };
    }
    const blog = await prisma.blog.findUnique({
      where: {
        id,
      },
      include: {
        image: true,
      },
    });
    if (!blog) return { success: false, message: "Blog bulunamadı." };
    try {
      await DeleteImageToAsset(blog.image.url);
    } catch (error) {
      return { success: false, message: "Resim silinirken hata oluştu." };
    }
    await prisma.blog.delete({
      where: {
        id,
      },
    });
    return { success: true, message: "Blog başarıyla silindi." };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Bir hata oluştu. Lütfen tekrar deneyiniz.",
    };
  }
}
export async function BlogImageDelete(url: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const session = await isAuthorized();
    if (!session) {
      return { success: false, message: "Yetkisiz erişim" };
    }
    if (!url) {
      return {
        success: false,
        message: "Url gereklidir",
      };
    }
    try {
      await DeleteImageToAsset(url);
    } catch (error) {
      return { success: false, message: "Resim silinirken bir hata oluştu" };
    }
    await prisma.image.delete({
      where: { url },
    });
    return { success: true, message: "Resim başarıyla silindi." };
  } catch (error) {
    return {
      success: false,
      message: "Bir hata oluştu. Lütfen tekrar deneyiniz.",
    };
  }
}
export async function readAllImageSecureUrl(): Promise<string[]> {
  try {
    const session = await isAuthorized();
    if (!session) {
      return [];
    }
    const images = await prisma.richTextImageGallery.findMany();
    return images.map(
      (image) =>
        `${process.env.NEXT_PUBLIC_APP_URL}/api/user/asset/image-gallery?url=${image.url}&quality=80`,
    );
  } catch (error) {
    return [];
  }
}

export async function DeleteImageForRichText(fileName: string) {
  try {
    const session = await isAuthorized();
    if (!session) {
      return { success: false, message: "Yetkisiz erişim" };
    }

    if (!fileName) {
      return {
        success: false,
        message: "Dosya adı gereklidir",
      };
    }

    const directoryPath = path.join("rich-text-assets", fileName);

    try {
      await fs.unlink(directoryPath);
      await prisma.richTextImageGallery.delete({
        where: { url: fileName },
      });
      return { success: true, message: "Resim başarıyla silindi" };
    } catch (error) {
      console.error("Silme hatası:", error);
      return { success: false, message: "Resim silinirken bir hata oluştu" };
    }
  } catch (error) {
    console.error("Genel hata:", error);
    return { success: false, message: "Bir hata oluştu" };
  }
}
