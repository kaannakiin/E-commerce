// app/(admin)/layout.tsx
import { auth } from "@/auth";
import { Box } from "@mantine/core";
import { redirect } from "next/navigation";
import AdminNav from "./_components/AdminNav";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <Box>
      <AdminNav />
      <main
        style={{
          padding: "1.5rem",
          minHeight: "calc(100vh - 60px)",
          backgroundColor: "#f8f9fa",
          marginTop: "60px",
        }}
      >
        {children}
      </main>
    </Box>
  );
}
