import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cache } from "react";
import { Footer } from "./Footer";
import { Prisma } from "@prisma/client";
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
  return salerInfo;
});

const FooterWrapper = async () => {
  const session = await auth();
  const isVisible = session?.user ? true : false;
  const salerInfo = await feedFooter();

  return <Footer salerInfo={salerInfo} isVisible={isVisible} />;
};

export default FooterWrapper;
