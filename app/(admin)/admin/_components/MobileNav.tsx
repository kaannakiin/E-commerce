import { Drawer, NavLink, Stack } from "@mantine/core";
import Link from "next/link";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { BiCategory } from "react-icons/bi";
import { GoPackage } from "react-icons/go";
import { IoSettingsOutline } from "react-icons/io5";
import { MdOutlineLocalOffer } from "react-icons/md";
const navItems = [
  {
    label: "Ürünler",
    href: "/admin/urunler",
    icon: <AiOutlineShoppingCart size={20} />,
  },
  {
    label: "Kategoriler",
    href: "/admin/kategoriler",
    icon: <BiCategory size={20} />,
  },
  {
    label: "Siparişler",
    href: "/admin/indirim-kodu",
    icon: <GoPackage size={20} />,
  },
  {
    label: "İndirim Kodları",
    href: "/admin/indirim-kodu",
    icon: <MdOutlineLocalOffer size={20} />,
  },
  {
    label: "Ayarlar",
    href: "/admin/ayarlar",
    icon: <IoSettingsOutline size={20} />,
  },
];

export function MobileNav({
  opened,
  onClose,
  pathname,
}: {
  opened: boolean;
  onClose: () => void;
  pathname: string;
}) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      size="280px"
      padding={0}
      styles={{
        header: { padding: 0 },
        body: { padding: 0 },
      }}
    >
      <Stack gap="xs" p="md">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            component={Link}
            href={item.href}
            label={item.label}
            leftSection={item.icon}
            active={pathname === item.href}
            variant={pathname === item.href ? "filled" : "light"}
            style={{
              borderRadius: "8px",
            }}
            styles={{
              root: {
                "&[data-active]": {
                  backgroundColor: "#5474b4",
                },
              },
            }}
          />
        ))}
      </Stack>
    </Drawer>
  );
}
