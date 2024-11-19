import { Group } from "@mantine/core";
import Link from "next/link";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
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
];

export function DesktopNav({ pathname }: { pathname: string }) {
  return (
    <Group gap="lg">
      {navItems.map((item) => (
        <Link
          href={item.href}
          key={item.href}
          style={{
            color: pathname === item.href ? "#5474b4" : "#666",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          {item.label}
        </Link>
      ))}
    </Group>
  );
}
