import { prisma } from "@/lib/prisma";
import { Params } from "@/types/types";
import { Prisma } from "@prisma/client";
import { notFound } from "next/navigation";
import { cache } from "react";
import EmailTemplateForm from "../_components/EmailTemplateForm";
import { EmailTemplateTypeForUI } from "../types/type";
export type SalerInfoType = Prisma.SalerInfoGetPayload<{
  select: {
    logo: {
      select: {
        url: true;
      };
    };
    contactEmail: true;
    contactPhone: true;
    pinterest: true;
    instagram: true;
    twitter: true;
    facebook: true;
    storeName: true;
    whatsapp: true;
    address: true;
  };
} | null>;
export type SeoType = Prisma.MainSeoSettingsGetPayload<{
  select: {
    themeColorSecondary: true;
  };
} | null>;
export type formValues = Prisma.EmailTemplateGetPayload<{
  select: {
    altText: true;
    buttonText: true;
    buttonColor: true;
    title: true;
  };
} | null>;
const feedPage = cache(async (slug: EmailTemplateTypeForUI) => {
  try {
    const salerInfo = await prisma.salerInfo.findFirst({
      select: {
        logo: {
          select: {
            url: true,
          },
        },
        contactEmail: true,
        contactPhone: true,
        pinterest: true,
        instagram: true,
        twitter: true,
        facebook: true,
        storeName: true,
        whatsapp: true,
        address: true,
      },
    });
    const seo = await prisma.mainSeoSettings.findFirst({
      select: {
        themeColorSecondary: true,
      },
    });
    const formValues = await prisma.emailTemplate.findFirst({
      where: {
        type: slug,
      },
      select: {
        altText: true,
        buttonText: true,
        buttonColor: true,
        title: true,
      },
    });
    return { salerInfo, seo, formValues };
  } catch (error) {
    console.log(error);
    return notFound();
  }
});

const SlugPage = async ({ params }: { params: Params }) => {
  const slug = (await params).slug as EmailTemplateTypeForUI;

  const { salerInfo, seo, formValues } = await feedPage(slug);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          E-posta Şablonu Düzenleme
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Bu sayfada e-posta şablonunuzu düzenleyebilir ve önizleyebilirsiniz.
        </p>
      </div>

      <EmailTemplateForm
        slug={slug}
        salerInfo={salerInfo}
        seo={seo}
        formValues={formValues}
      />
    </div>
  );
};

export default SlugPage;
