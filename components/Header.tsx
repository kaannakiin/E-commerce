import { Group, Indicator } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { IoMdHeartEmpty } from "react-icons/io";
import { RiUserLine } from "react-icons/ri";
import SearchDrawer from "./SearchDrawer";
const Links = [
  {
    href: "/",
    text: "Category1",
  },
  {
    href: "/",
    text: "Category1",
  },
  {
    href: "/",
    text: "Category1",
  },
  {
    href: "/",
    text: "Category1",
  },
];

const Header = () => {
  return (
    <Group h={80} px={20} py={10} grow>
      <div className="h-full  flex flex-row gap-4 items-center">
        {Links.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className="relative text-black hover:text-blue-400 cursor-pointer transition-all ease-in-out before:transition-[width] before:ease-in-out before:duration-700 before:absolute before:bg-gray-400 before:origin-center before:h-[2px] before:w-0 hover:before:w-[50%] before:bottom-0 before:left-[50%] after:transition-[width] after:ease-in-out after:duration-700 after:absolute after:bg-gray-400 after:origin-center after:h-[2px] after:w-0 hover:after:w-[50%] after:bottom-0 after:right-[50%]  "
          >
            {link.text}
          </Link>
        ))}
      </div>
      <div className="h-full  w-full  relative">
        <Image
          src={"/WELLNESSCLUBLOGO.svg"}
          alt="deneme "
          fill
          sizes="100%"
          className="object-contain min-h-full h-auto w-full min-w-full"
        />
      </div>
      <div className="h-full   flex flex-row-reverse items-center gap-5">
        <HiOutlineShoppingBag className="cursor-pointer" size={28} />
        <Link href={"/giris"} className="w-7 h-7 relative">
          <RiUserLine className="cursor-pointer object-contain h-full w-full" />
        </Link>
        <Indicator
          label="0"
          inline
          size={16}
          offset={2}
          radius={"lg"}
          classNames={{ indicator: "font-bold" }}
        >
          <IoMdHeartEmpty size={28} className="cursor-pointer" />
        </Indicator>
        <SearchDrawer />
      </div>
    </Group>
  );
};

export default Header;
