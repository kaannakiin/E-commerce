import FooterWrapper from "@/components/FooterServer";
import Header from "@/components/Header";
import { prisma } from "@/lib/prisma";
import { cache, Fragment } from "react";
import { FaWhatsapp } from "react-icons/fa";
const feedPage = cache(async () => {
  const infoWhatsapp = await prisma.salerInfo.findFirst({
    select: {
      whatsapp: true,
    },
  });
  if (!infoWhatsapp) return null;
  return infoWhatsapp.whatsapp;
});
export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const phoneNumber = await feedPage();
  return (
    <Fragment>
      <Header />
      <main className="min-h-[700px]">{children}</main>
      {phoneNumber && (
        <a
          href={`https://wa.me/+90${phoneNumber.replace(/\D/g, "")}`}
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
