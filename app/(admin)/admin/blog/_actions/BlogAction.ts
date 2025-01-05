"use server";

import { DeleteImageToAsset } from "@/lib/deleteImageFile";
import { isAuthorized } from "@/lib/isAdminorSuperAdmin";
import { prisma } from "@/lib/prisma";
import { processImages } from "@/lib/recordImage";
import { slugify } from "@/utils/SlugifyVariants";
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
