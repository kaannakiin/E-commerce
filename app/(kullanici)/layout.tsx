import FooterWrapper from "@/components/FooterServer";
import Header from "@/components/Header";
import { prisma } from "@/lib/prisma";
import { cache, Fragment } from "react";
import { FaWhatsapp } from "react-icons/fa";
import CustomMarquee from "./_components/CustomMarquee";
import { Divider } from "@mantine/core";
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
      whatsapp: whatsappNumber, // Direkt string değerini döndür
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
      {whatsapp && (
        <a
          href={`https://wa.me/+90${whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-[70px] right-6 z-50 rounded-full bg-green-500 p-3 text-white shadow-lg transition-all duration-300 hover:bg-green-600"
          aria-label="WhatsApp ile iletişime geçin"
        >
          <FaWhatsapp size={24} />
        </a>
      )}
      <FooterWrapper />
    </Fragment>
  );
}
