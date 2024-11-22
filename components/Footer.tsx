import {
  Accordion,
  AccordionControl,
  AccordionItem,
  AccordionPanel,
  Divider,
} from "@mantine/core";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaInstagram, FaYoutube, FaTiktok, FaPinterest } from "react-icons/fa";
const Footer = () => {
  const contracts = [
    "Kurumsal Satış Sözleşmesi",
    "Kurumsal Satış Sözleşmesi",
    "Kurumsal Satış Sözleşmesi",
    "Kurumsal Satış Sözleşmesi",
  ];

  return (
    <div className="flex w-full flex-row px-5">
      <div className="flex w-full flex-col">
        <div className="relative h-12 w-full">
          <Image
            src={"/WELLNESSCLUBLOGO.svg"}
            sizes="100vw"
            alt="Logo Footer"
            fill
            className="object-contain"
          />
        </div>

        {/* LEFT SECTION */}
        <div className="hidden w-full flex-row items-start justify-between md:flex">
          {/* Üyelik */}
          <div className="flex flex-col gap-2 text-sm text-gray-500">
            <h1 className="text-start text-xl font-bold text-black">Üyelik</h1>
            <Link
              href="/"
              className="transition-colors duration-300 hover:text-gray-800"
            >
              Giriş yap{" "}
            </Link>
            <Link
              href="/"
              className="transition-colors duration-300 hover:text-gray-800"
            >
              Üye ol{" "}
            </Link>
          </div>
          <div className="flex flex-col gap-2 text-sm text-gray-500">
            <h1 className="text-start text-xl font-bold text-black">
              Kurumsal
            </h1>
            {contracts.map((contract, index) => (
              <Link
                key={index}
                href={"/"}
                className="transition-colors duration-300 hover:text-gray-800"
              >
                {contract}
              </Link>
            ))}
          </div>

          {/* İletişim */}
          <div className="flex flex-col gap-2 text-sm text-gray-500">
            <h1 className="text-start text-xl font-bold text-black">
              İletişim
            </h1>
            <div className="flex flex-col gap-1">
              <p className="hover:text-gray-800">Tel: +90 (xxx) xxx xx xx</p>
              <p className="hover:text-gray-800">
                E-posta: info@wellnessclub.com
              </p>
              <p className="hover:text-gray-800">Adres: İstanbul, Türkiye</p>
            </div>
          </div>
        </div>
        <div className="w-full md:hidden">
          <Accordion variant="filled">
            <AccordionItem value="membership">
              <AccordionControl>
                <span className="font-bold">Üyelik</span>
              </AccordionControl>
              <AccordionPanel>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/"
                    className="text-gray-500 transition-colors duration-300 hover:text-gray-800"
                  >
                    Giriş yap{" "}
                  </Link>
                  <Link
                    href="/"
                    className="text-gray-500 transition-colors duration-300 hover:text-gray-800"
                  >
                    Üye ol{" "}
                  </Link>
                </div>
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem value="contracts">
              <AccordionControl>
                <span className="font-bold">Kurumsal</span>
              </AccordionControl>
              <AccordionPanel>
                <div className="flex flex-col gap-2">
                  {contracts.map((contract, index) => (
                    <Link
                      key={index}
                      href={"/"}
                      className="text-gray-500 transition-colors duration-300 hover:text-gray-800"
                    >
                      {contract}
                    </Link>
                  ))}
                </div>
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem value="contact">
              <AccordionControl>
                <span className="font-bold">İletişim</span>
              </AccordionControl>
              <AccordionPanel>
                <div className="flex flex-col gap-2 text-gray-500">
                  <p className="hover:text-gray-800">
                    Tel: +90 (xxx) xxx xx xx
                  </p>
                  <p className="hover:text-gray-800">
                    E-posta: info@wellnessclub.com
                  </p>
                  <p className="hover:text-gray-800">
                    Adres: İstanbul, Türkiye
                  </p>
                </div>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="flex w-full flex-row justify-between gap-2 px-4 lg:gap-0">
          <div className="flex flex-row gap-2">
            <Link href={"/"} className="flex flex-row items-center">
              <FaInstagram size={24} />
            </Link>
            <Link href={"/"} className="flex flex-row items-center">
              <FaTiktok size={24} className="text-black" />
            </Link>{" "}
          </div>
          <div className="relative h-10 w-[200px] lg:w-[400px]">
            <Image
              src={"/logo_band_colored.svg"}
              alt="PaymentLogoFooter"
              fill
              sizes="100%"
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
