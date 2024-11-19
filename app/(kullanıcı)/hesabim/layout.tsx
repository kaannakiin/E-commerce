import { auth } from "@/auth";
import Navbar from "./_components/Navbar";

export default async function HesabimLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="container mx-auto flex flex-col gap-8 px-4 py-8 lg:flex-row">
      <Navbar session={session.user} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
