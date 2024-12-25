"use client";

import { signOutUser } from "@/actions/signOut";
import { Button, Menu } from "@mantine/core";
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
  const { push, refresh } = useRouter();

  const handleAuth = (tab: "giris" | "kayit") => {
    const currentQuery = params.toString();
    const fullPath = `${pathname}${currentQuery ? `?${currentQuery}` : ""}`;
    const encodedCallbackUrl = encodeURIComponent(fullPath);
    push(`/giris?tab=${tab}&callbackUrl=${encodedCallbackUrl}`);
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
              component={Link}
              variant="subtle"
              color="black"
              href={"/hesabim"}
              leftSection={<RiUserLine size={18} />}
              classNames={{
                inner:
                  "flex flex-row items-center pl-1  justify-start gap-1 w-full",
              }}
            >
              Hesabım
            </Button>

            <Button
              size="xs"
              component={Link}
              variant="subtle"
              color="black"
              href="/hesabim/favoriler"
              classNames={{
                inner:
                  "flex flex-row items-center  pl-1  justify-start gap-1 w-full",
              }}
              leftSection={<RiHeartLine size={18} />}
            >
              Favorilerim
            </Button>

            <Button
              size="xs"
              component={Link}
              variant="subtle"
              color="black"
              href="/hesabim/siparislerim"
              classNames={{
                inner:
                  "flex flex-row items-center pl-1 justify-start gap-1 w-full",
              }}
              leftSection={<RiFileListLine size={18} />}
            >
              Siparişlerim
            </Button>

            <Button
              size="xs"
              variant="subtle"
              color="black"
              classNames={{
                inner:
                  "flex flex-row items-center pl-1 justify-start gap-1 w-full",
              }}
              onClick={async () => await signOutUser().then(() => refresh())}
              leftSection={<RiLogoutBoxLine size={18} />}
            >
              Çıkış yap
            </Button>
          </div>
        ) : (
          <div className="my-2 flex w-full flex-col gap-2">
            <Button
              size="xs"
              variant="subtle"
              color="black"
              classNames={{
                inner:
                  "flex flex-row items-center pl-1 justify-start gap-1 w-full",
              }}
              leftSection={<RiLoginBoxLine size={18} />}
              onClick={() => handleAuth("giris")}
            >
              Giriş Yap
            </Button>
            <Button
              size="xs"
              variant="subtle"
              color="black"
              classNames={{
                inner:
                  "flex flex-row items-center pl-1 justify-start gap-1 w-full",
              }}
              leftSection={<RiUserAddLine size={18} />}
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
