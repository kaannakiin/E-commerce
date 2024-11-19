"use client";

import { Menu, Button } from "@mantine/core";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  RiFileListLine,
  RiHeartLine,
  RiLogoutBoxLine,
  RiUserLine,
  RiLoginBoxLine,
  RiUserAddLine,
} from "react-icons/ri";

const MenuUser = () => {
  const session = useSession();
  return (
    <Menu
      shadow="xl"
      width={180}
      position="bottom"
      trigger="click-hover"
      transitionProps={{ transition: "fade-up", duration: 300 }}
    >
      <Menu.Target>
        <RiUserLine size={28} className="cursor-pointer" />
      </Menu.Target>
      {session.status !== "loading" && (
        <Menu.Dropdown>
          {session.data ? (
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
                href={"/"}
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
                href="/favorilerim"
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
                href="/siparislerim"
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
                onClick={() => signOut()}
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
                onClick={() => signIn(undefined, { redirect: true })}
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
                onClick={() => signIn(undefined, { redirect: true })}
              >
                Kayıt Ol
              </Button>
            </div>
          )}
        </Menu.Dropdown>
      )}
    </Menu>
  );
};

export default MenuUser;
