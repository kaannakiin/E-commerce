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
    <div className="flex flex-row w-full px-5 ">
      {/* LOGO SECTION */}
      <div className="flex flex-col w-full">
        <div className="w-full relative h-12">
          <Image
            src={"/WELLNESSCLUBLOGO.svg"}
            sizes="100vw"
            alt="Logo Footer"
            fill
            className="object-contain"
          />
        </div>
        <Divider my={10} />
        {/* LEFT SECTION */}
        <div className="hidden md:flex flex-row items-start justify-between w-full">
          {/* Üyelik */}
          <div className="text-gray-500 text-sm flex flex-col gap-2">
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
          <div className="text-gray-500 text-sm flex flex-col gap-2">
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
          <div className="text-gray-500 text-sm flex flex-col gap-2">
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
        <div className="md:hidden w-full">
          <Accordion variant="filled">
            <AccordionItem value="membership">
              <AccordionControl>
                <span className="font-bold">Üyelik</span>
              </AccordionControl>
              <AccordionPanel>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/"
                    className="transition-colors duration-300 hover:text-gray-800 text-gray-500"
                  >
                    Giriş yap{" "}
                  </Link>
                  <Link
                    href="/"
                    className="transition-colors duration-300 hover:text-gray-800 text-gray-500"
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
                      className="transition-colors duration-300 hover:text-gray-800 text-gray-500"
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
        <Divider my={10} />
        <div className="flex flex-row  justify-between w-full">
          <div className="flex flex-row gap-2 ">
            <Link href={"/"} className="flex flex-row items-center">
              <FaInstagram size={24} />
            </Link>
            <Link href={"/"} className="flex flex-row items-center">
              <FaYoutube size={24} />
            </Link>{" "}
            <Link href={"/"} className="flex flex-row items-center">
              <FaTiktok size={24} className="text-black" />
            </Link>{" "}
            <Link href={"/"} className="flex flex-row items-center">
              <FaPinterest size={24} />
            </Link>
          </div>
          <div className="w-[200px] lg:w-[400px] relative h-10  ">
            <Image
              src={"/logo_band_colored.svg"}
              alt="PaymentLogoFooter"
              fill
              sizes="100%"
              className="object-contain h-full w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
