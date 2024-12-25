"use server";
import { prisma } from "@/lib/prisma";
import { MarqueeFormValues, marquueFormSchema } from "@/zodschemas/authschema";
import { ZodError } from "zod";

export async function MarqueeAction(
  data: MarqueeFormValues,
): Promise<{ success: boolean; message: string }> {
  try {
    marquueFormSchema.parse(data);
    const marquee = await prisma.customMarquee.findFirst();
    if (marquee) {
      await prisma.customMarquee.update({
        where: {
          id: marquee.id,
        },
        data: {
          bgColor: data.bgColor,
          fontSize: data.fontSize.toString(),
          isActive: data.isActive,
          SlidingSpeed: data.slidingSpeed.toString(),
          text: data.text,
          textColor: data.textColor,
          textPadding: data.textPadding.toString(),
          url: data.url,
        },
      });
    } else {
      await prisma.customMarquee.create({
        data: {
          bgColor: data.bgColor,
          fontSize: data.fontSize.toString(),
          isActive: data.isActive,
          SlidingSpeed: data.slidingSpeed.toString(),
          text: data.text,
          textColor: data.textColor,
          textPadding: data.textPadding.toString(),
          url: data.url,
        },
      });
      return { success: true, message: "Marquee başarıyla oluşturuldu." };
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: error.errors[0].message,
      };
    }
    console.log(error);
    return {
      success: false,
      message: "Bir hata oluştu. Lütfen tekrar deneyiniz.",
    };
  }
}
