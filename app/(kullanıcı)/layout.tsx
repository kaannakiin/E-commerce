import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Fragment } from "react";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Fragment>
      <Header />
      <main className="min-h-[700px]">{children}</main>
      <Footer />
    </Fragment>
  );
}
