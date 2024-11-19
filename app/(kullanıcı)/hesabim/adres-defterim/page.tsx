import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AddressBook from "./_components/AddressBook";
import AddressList from "./_components/AddressList";

const DashboardPage = async () => {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      name: true,
      email: true,
      phone: true,
      Adress: {
        where: {
          isDeleted: false,
        },
        select: {
          id: true,
          name: true,
          surname: true,
          phone: true,
          city: true,
          district: true,
          addressDetail: true,
          addressTitle: true,
        },
      },
    },
  });
  if (user.Adress.length === 0) {
    return (
      <div>
        <AddressBook email={session.user.email} />
      </div>
    );
  }
  return (
    <div>
      <AddressList addresses={user.Adress} email={session.user.email} />
    </div>
  );
};

export default DashboardPage;
