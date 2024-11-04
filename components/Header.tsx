import { Indicator } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { IoMdHeartEmpty } from "react-icons/io";
import SearchSpotlight from "./SearchSpotlight";
import BurgerMenu from "./BurgerMenu";
import MenuUser from "./MenuUser";
import { getFeaturedProducts } from "@/actions/user/get-featured-products";
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

const Header = async () => {
  const featuredProducts = await getFeaturedProducts();
  return (
    <div className="h-20   lg:px-5 flex flex-row gap-5  ">
      {/* LEFT SECTION */}
      <div className="hidden lg:flex flex-row gap-4 items-center w-1/3 ">
        {Links.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className="relative  text-black hover:text-blue-400 cursor-pointer transition-all ease-in-out before:transition-[width] before:ease-in-out before:duration-700 before:absolute before:bg-primary-400 before:origin-center before:h-[2px] before:w-0 hover:before:w-[50%] before:bottom-0 before:left-[50%] after:transition-[width] after:ease-in-out after:duration-700 after:absolute after:bg-primary-400 after:origin-center after:h-[2px] after:w-0 hover:after:w-[50%] after:bottom-0 after:right-[50%]  "
          >
            {link.text}
          </Link>
        ))}
      </div>
      <div className="  flex-1 flex flex-row items-center justify-between lg:pl-10 lg:pr-5">
        {/* LOGO SECTION */}
        <div className="w-52 sm:w-72 h-full relative">
          <Image
            src={"/WELLNESSCLUBLOGO.svg"}
            alt="Alt"
            fill
            sizes="100vw"
            className="object-contain h-full w-full"
          />
        </div>
        {/* RIGHT SECTION */}
        <div className=" flex flex-row gap-2  lg:gap-5 items-center justify-start">
          <SearchSpotlight featuredProducts={featuredProducts} />
          <IoMdHeartEmpty
            size={28}
            className="lg:block hidden cursor-pointer"
          />
          <MenuUser />

          <Indicator
            label="0"
            inline
            size={16}
            offset={2}
            radius={"lg"}
            classNames={{ indicator: "font-bold" }}
          >
            <HiOutlineShoppingBag className="cursor-pointer" size={28} />
          </Indicator>
          <BurgerMenu />
        </div>
      </div>
    </div>
  );
};

export default Header;
