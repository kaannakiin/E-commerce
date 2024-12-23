"use client";

import { Button, Menu } from "@mantine/core";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  RiFileListLine,
  RiHeartLine,
  RiLoginBoxLine,
  RiLogoutBoxLine,
  RiUserAddLine,
  RiUserLine,
} from "react-icons/ri";
const MenuUser = ({ isUser }: { isUser: boolean }) => {
  const params = useSearchParams();
  const pathname = usePathname();
  const { push } = useRouter();
  const handleAuth = (tab: "giris" | "kayit") => {
    const currentQuery = params.toString();
    const fullPath = `${pathname}${currentQuery ? `?${currentQuery}` : ""}`;
    const encodedCallbackUrl = encodeURIComponent(fullPath);
    push(`/giris?tab=${tab}&callbackUrl=${encodedCallbackUrl}`);
  };
  const handleSignOut = () => {
    const currentQuery = params.toString();
    const fullPath = `${pathname}${currentQuery ? `?${currentQuery}` : ""}`;
    signOut({ redirect: true, redirectTo: `/${fullPath}` });
  };
  return (
    <Menu
      shadow="xl"
      width={180}
      position="bottom"
      trigger="click"
      transitionProps={{ transition: "fade-up", duration: 300 }}
    >
      <Menu.Target>
        <RiUserLine size={28} className="cursor-pointer" />
      </Menu.Target>
      <Menu.Dropdown>
        {isUser ? (
          <div className="my-2 flex w-full flex-col gap-2">
            <Button
              size="xs"
              variant="subtle"
              classNames={{
                inner: "p-0",
                label: "w-full flex items-center gap-2",
              }}
              className="transition-all duration-200 hover:text-black"
              component={Link}
              href={"/hesabim"}
            >
              <RiUserLine size={18} />
              Hesabım
            </Button>

            <Button
              size="xs"
              variant="subtle"
              className="transition-all duration-200 hover:text-black"
              classNames={{
                inner: "p-0",
                label: "w-full flex items-center gap-2",
              }}
              component={Link}
              href="/hesabim/favoriler"
            >
              <RiHeartLine size={18} />
              Favorilerim
            </Button>

            <Button
              size="xs"
              variant="subtle"
              className="transition-all duration-200 hover:text-black"
              classNames={{
                inner: "p-0",
                label: "w-full flex items-center gap-2",
              }}
              component={Link}
              href="/hesabim/siparislerim"
            >
              <RiFileListLine size={18} />
              Siparişlerim
            </Button>

            <Button
              size="xs"
              variant="subtle"
              className="transition-all duration-200 hover:text-red-500"
              classNames={{
                inner: "p-0",
                label: "w-full flex items-center gap-2 ",
              }}
              onClick={handleSignOut}
            >
              <RiLogoutBoxLine size={18} />
              Çıkış yap
            </Button>
          </div>
        ) : (
          <div className="my-2 flex w-full flex-col gap-2">
            <Button
              radius={"sm"}
              variant="subtle"
              fullWidth
              leftSection={<RiLoginBoxLine size={18} />}
              classNames={{
                inner: "p-0",
                label: "w-full flex items-center gap-2 ",
              }}
              onClick={() => handleAuth("giris")}
            >
              Giriş Yap
            </Button>
            <Button
              radius={"sm"}
              fullWidth
              variant="subtle"
              leftSection={<RiUserAddLine size={18} />}
              classNames={{
                inner: "p-0",
                label: "w-full flex items-center gap-2 ",
              }}
              onClick={() => handleAuth("kayit")}
            >
              Kayıt Ol
            </Button>
          </div>
        )}
      </Menu.Dropdown>
    </Menu>
  );
};

export default MenuUser;
