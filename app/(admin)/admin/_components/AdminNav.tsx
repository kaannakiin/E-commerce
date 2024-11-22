"use client";
import { Burger, Group } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { UserInfo } from "./userInfo";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";

export default function AdminNav() {
  const mobile = useMediaQuery("(max-width: 768px)");
  const [opened, setOpened] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <Group
        h={60}
        px="md"
        align="center"
        justify="space-between"
        className="mb-3 w-full"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
          borderBottom: "1px solid #eee",
          zIndex: 1000,
        }}
      >
        <UserInfo />

        {mobile ? (
          <Group gap="md">
            <Link
              href="/admin"
              style={{
                color: pathname === "/admin" ? "#5474b4" : "#666",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Anasayfa
            </Link>
            <Burger opened={opened} onClick={() => setOpened(!opened)} />
          </Group>
        ) : (
          <DesktopNav pathname={pathname} />
        )}
      </Group>

      {mobile && (
        <MobileNav
          opened={opened}
          onClose={() => setOpened(false)}
          pathname={pathname}
        />
      )}
    </>
  );
}
