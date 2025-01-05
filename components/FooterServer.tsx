import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cache } from "react";
import { Footer } from "./Footer";
import { Prisma } from "@prisma/client";
import { slugify } from "@/utils/SlugifyVariants";
export type FooterType = Prisma.SalerInfoGetPayload<{
  select: {
    logo: {
      select: {
        url: true;
      };
    };
    contactEmail: true;
    contactPhone: true;
    address: true;
    facebook: true;
    instagram: true;
    pinterest: true;
    twitter: true;
    whatsapp: true;
    storeName: true;
  };
}>;
const feedFooter = cache(async () => {
  const policies = await prisma.policies.findMany({
    select: {
      type: true,
      title: true,
    },
  });
  const salerInfo = await prisma.salerInfo.findFirst({
    select: {
      logo: {
        select: {
          url: true,
        },
      },
      contactEmail: true,
      contactPhone: true,
      address: true,
      facebook: true,
      instagram: true,
      pinterest: true,
      twitter: true,
      whatsapp: true,
      storeName: true,
    },
  });
  return {
    salerInfo,
    policies: policies.map((policy) => ({
      type: policy.type,
      title: policy.title,
      slug: slugify(policy.type),
    })),
  };
});

const FooterWrapper = async () => {
  const session = await auth();
  const isVisible = session?.user ? true : false;
  const { salerInfo, policies } = await feedFooter();

  return (
    <Footer salerInfo={salerInfo} isVisible={isVisible} policies={policies} />
  );
};

export default FooterWrapper;
