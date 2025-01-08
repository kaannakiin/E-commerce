// app/(admin)/layout.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Box } from "@mantine/core";
import { redirect } from "next/navigation";
import { cache } from "react";
import Info from "./_components/Info";
import { HeaderSearch } from "./_components/AdminHeader";
import Provider from "@/providers/ImageProvider";
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
      <HeaderSearch />

      <main>
        {info === null ? <Info /> : null}
        <Provider>{children}</Provider>
      </main>
    </Box>
  );
}
