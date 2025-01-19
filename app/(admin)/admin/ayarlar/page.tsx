"use client";
import { UnstyledButton } from "@mantine/core";
import Link from "next/link";
import {
  CiCircleChevDown,
  CiImageOn,
  CiMenuBurger,
  CiUser,
  CiViewTable,
} from "react-icons/ci";
import { FaQuestion } from "react-icons/fa";
import { MdOutlinePayment } from "react-icons/md";
import { RiAdvertisementLine } from "react-icons/ri";
import { TbContract } from "react-icons/tb";
import { TfiLayoutSlider } from "react-icons/tfi";

interface MenuButtonProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  disabled?: boolean;
}

const MenuButton = ({
  icon,
  title,
  description,
  href,
  disabled,
}: MenuButtonProps) => (
  <UnstyledButton
    component={Link}
    href={href}
    className={`flex flex-row items-center gap-4 rounded-lg border border-gray-100 bg-white p-3 transition-all ${
      disabled ? "cursor-not-allowed opacity-50" : "hover:bg-gray-50"
    }`}
    onClick={(e) => {
      if (disabled) {
        e.preventDefault();
      }
    }}
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
      icon: <CiMenuBurger className="h-6 w-6 text-primary-600" />,
      title: " Favicon ve Tema Rengi",
      description: "Anasayfa görselini ve faviconu düzenleyin.",
      href: "/admin/ayarlar/temalar",
    },
    {
      icon: <TfiLayoutSlider className="h-6 w-6 text-primary-600" />,
      title: "Sliderlar",
      description: "Sliderları düzenleyin.",
      href: "/admin/ayarlar/slider",
    },
    {
      icon: <CiImageOn className="h-6 w-6 text-primary-600" />,
      title: "Kayan Yazı ve Alt İmageler",
      description: "Kayan yazı ve alt resimleri düzenleyin.",
      href: "/admin/ayarlar/edit-homepage-section",
    },
    {
      icon: <CiCircleChevDown className="h-6 w-6 text-primary-600" />,
      title: "Email Ayarları",
      description: "Email Ayarları düzenleyin.",
      href: "/admin/ayarlar/e-mail",
    },
    {
      icon: <TbContract className="h-6 w-6 text-primary-600" />,
      title: "Sözleşme Yönetimi",
      description: "Sözleşmeleri düzenleyin.",
      href: "/admin/ayarlar/sozlesmeler",
    },
    {
      icon: <MdOutlinePayment className="h-6 w-6 text-primary-600" />,
      title: "Ödeme Yöntemleri",
      description: "Ödeme yöntemlerini düzenleyin.",
      href: "/admin/ayarlar/odeme-yontemleri",
    },
    {
      icon: <FaQuestion className="h-6 w-6 text-primary-600" />,
      title: "Sık Sorulan Sorular ",
      description: "Sık sorulan soruları düzenleyin.",
      href: "/admin/ayarlar/faq-section",
    },
    {
      icon: <CiUser className="h-6 w-6 text-primary-600" />,
      title: "Kullanıcı ve Rol Yönetimi",
      description: "Kullanıcı ve rol yönetimini düzenleyin.",
      href: "/admin/ayarlar/hesaplar",
    },
    {
      icon: <RiAdvertisementLine className="h-6 w-6 text-primary-600" />,
      title: "Reklam ve Google Yönetimi",
      description: "Reklam ve google yönetimini düzenleyin.",
      href: "/admin/ayarlar/google-settings",
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
