"use client";
import { Burger, Group, Drawer } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { UserInfo } from "./userInfo";
import classes from "./stlyes/Header.module.css";
import { usePathname, useRouter } from "next/navigation";
import { Fragment } from "react";

const links = [
  {
    label: "Anasayfa",
    href: "/admin",
  },
  {
    label: "Ürünler",
    href: "/admin/urunler",
  },
  {
    label: "Kategoriler",
    href: "/admin/kategoriler",
  },
  {
    label: "Siparişler",
    href: "/admin/siparisler",
  },
  {
    label: "İndirim Kodları",
    href: "/admin/indirim-kodu",
  },
  {
    label: "Ayarlar",
    href: "/admin/ayarlar",
  },
];

export function HeaderSearch() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLinkClick = (href: string) => {
    router.push(href);
    close();
  };

  const items = links.map((link) => (
    <a
      key={link.label}
      href={link.href}
      className={`${classes.link} ${pathname === link.href ? classes.active : ""}`}
      onClick={(event) => {
        event.preventDefault();
        handleLinkClick(link.href);
      }}
    >
      {link.label}
    </a>
  ));

  const drawerItems = links.map((link) => (
    <a
      key={link.label}
      href={link.href}
      className={`${classes.drawerLink} ${pathname === link.href ? classes.activeDrawer : ""}`}
      onClick={(event) => {
        event.preventDefault();
        handleLinkClick(link.href);
      }}
    >
      {link.label}
    </a>
  ));

  return (
    <Fragment>
      <Drawer
        opened={opened}
        onClose={close}
        size="xs"
        padding="md"
        title="Menu"
        hiddenFrom="sm"
      >
        <div className={classes.drawerContent}>{drawerItems}</div>
      </Drawer>

      <header className={classes.header}>
        <div className={classes.inner}>
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              size="sm"
              hiddenFrom="sm"
            />
            <UserInfo />
          </Group>
          <Group>
            <Group ml={50} gap={5} className={classes.links} visibleFrom="sm">
              {items}
            </Group>
          </Group>
        </div>
      </header>
    </Fragment>
  );
}
