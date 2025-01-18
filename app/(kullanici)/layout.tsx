import FooterWrapper from "@/components/FooterServer";
import Header from "@/components/Header";
import { prisma } from "@/lib/prisma";
import { Divider } from "@mantine/core";
import { cache, Fragment } from "react";
import AffixToTop from "./_components/AffixToTop";
import AffixWhatsapp from "./_components/AffixWhatsapp";
import CustomMarquee from "./_components/CustomMarquee";
const feedPage = cache(async () => {
  try {
    const [infoWhatsapp, marquee] = await Promise.all([
      prisma.salerInfo.findFirst({
        select: {
          whatsapp: true,
        },
      }),
      prisma.customMarquee.findFirst(),
    ]);

    const whatsappNumber = infoWhatsapp?.whatsapp || null;
    return {
      whatsapp: whatsappNumber,
      marquee: {
        text: marquee?.text || "Sepete  %10 indirim kazanın!",
        textColor: marquee?.textColor || "#f7f7f7",
        textPadding: marquee?.textPadding || 10,
        bgColor: marquee?.bgColor || "#f7f7f7",
        fontSize: marquee?.fontSize || 16,
        slidingSpeed: marquee?.SlidingSpeed || 20,
        isActive: marquee?.isActive ?? true,
        url: marquee?.url || "#",
      },
    };
  } catch (error) {
    console.error("Feed page error:", error);
    return {
      whatsapp: null,
      marquee: null,
      policies: [],
    };
  }
});
export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { whatsapp, marquee } = await feedPage();
  return (
    <Fragment>
      <Header />
      {marquee && <CustomMarquee {...marquee} />}
      <Divider size="sm" />
      <main className="lg:min-h-[700px]">{children}</main>
      {whatsapp && <AffixWhatsapp url={whatsapp} text="strin" />}
      <AffixToTop />
      <FooterWrapper />
    </Fragment>
  );
}
