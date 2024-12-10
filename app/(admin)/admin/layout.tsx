// app/(admin)/layout.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Alert, Box, Button } from "@mantine/core";
import { redirect } from "next/navigation";
import { cache } from "react";
import AdminNav from "./_components/AdminNav";
import { FaInfoCircle, FaArrowRight } from "react-icons/fa";
import Link from "next/link";
import Info from "./_components/Info";
const feedLayout = cache(async () => {
  try {
    const info = await prisma.salerInfo.findFirst();
    if (!info) {
      return null;
    }
    return info;
  } catch (error) {
    return error;
  }
});
export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }
  const info = await feedLayout();

  return (
    <Box>
      <AdminNav />

      <main
        style={{
          minHeight: "calc(100vh - 60px)",
          backgroundColor: "#f8f9fa",
          marginTop: "60px",
        }}
      >
        {info === null ? <Info /> : null}
        {children}
      </main>
    </Box>
  );
}
