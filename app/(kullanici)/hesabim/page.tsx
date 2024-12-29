import { auth } from "@/auth";
import { cache } from "react";
import UserInfoForm from "./_components/UserInfoForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
const feedPage = cache(async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        name: true,
        surname: true,
        email: true,
        phone: true,
        emailVerified: true,
      },
    });
    if (!user) return notFound();
    return user;
  } catch (error) {}
});
const page = async () => {
  const session = await auth();
  if (!session) return notFound();
  const user = await feedPage(session.user.id);
  return (
    <UserInfoForm
      email={user.email}
      name={user.name}
      phone={user.phone}
      surname={user.surname}
      emailVerified={user.emailVerified}
    />
  );
};

export default page;
