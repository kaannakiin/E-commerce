import { UnstyledButton } from "@mantine/core";
import Link from "next/link";
import {
  CiImageOn,
  CiMenuBurger,
  CiViewTable,
  CiShoppingTag,
  CiCreditCard1,
  CiViewList,
  CiCircleChevDown,
  CiViewBoard,
} from "react-icons/ci";
import { TfiLayoutSlider } from "react-icons/tfi";
interface MenuButtonProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}

const MenuButton = ({ icon, title, description, href }: MenuButtonProps) => (
  <UnstyledButton
    component={Link}
    href={href}
    className="flex flex-row items-center gap-4 rounded-lg border border-gray-100 bg-white p-3 transition-all hover:bg-gray-50"
  >
    <div className="flex items-center justify-center rounded-full bg-primary-50 p-2">
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="block font-medium text-primary-600">{title}</span>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  </UnstyledButton>
);

const SettingsPage = () => {
  const menuItems = [
    {
      icon: <CiViewTable className="h-6 w-6 text-primary-600" />,
      title: "Satıcı Bilgileri",
      description: "Satıcı bilgilerinizi yönetin.",
      href: "/admin/ayarlar/hesap",
    },
    {
      icon: <TfiLayoutSlider className="h-6 w-6 text-primary-600" />,
      title: "Sliderlar",
      description: "Sliderları düzenleyin.",
      href: "/admin/ayarlar/slider",
    },
    {
      icon: <CiMenuBurger className="h-6 w-6 text-primary-600" />,
      title: "Menü Yönetimi",
      description: "Menüleri düzenleyin.",
      href: "/admin/ayarlar/temalar",
    },
    {
      icon: <CiImageOn className="h-6 w-6 text-primary-600" />,
      title: "Bannerlar",
      description: "Bannerları yönetin.",
      href: "/admin/ayarlar/temalar",
    },
    {
      icon: <CiCircleChevDown className="h-6 w-6 text-primary-600" />,
      title: "Aşağı Açılır Menü",
      description: "Aşağı açılır menüleri yönetin.",
      href: "/admin/ayarlar/temalar",
    },
    {
      icon: <CiViewBoard className="h-6 w-6 text-primary-600" />,
      title: "Popup & Bar Yönetimi",
      description: "Popup ve Bar tasarımlarını yönetin.",
      href: "/admin/ayarlar/temalar",
    },
    {
      icon: <CiViewList className="h-6 w-6 text-primary-600" />,
      title: "Bloklar",
      description: "Sağ ve sol blokları yönetin.",
      href: "/admin/ayarlar/temalar",
    },
    {
      icon: <CiShoppingTag className="h-6 w-6 text-primary-600" />,
      title: "Vitrin Blokları",
      description: "Vitrin bloklarını yönetin.",
      href: "/admin/ayarlar/temalar",
    },
    {
      icon: <CiCreditCard1 className="h-6 w-6 text-primary-600" />,
      title: "Ödeme Sayfası Tasarımı",
      description: "Ödeme sayfası tasarımını yönetin.",
      href: "/admin/ayarlar/temalar",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {menuItems.map((item, index) => (
          <MenuButton
            key={index}
            icon={item.icon}
            title={item.title}
            href={item.href}
            description={item.description}
          />
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;
