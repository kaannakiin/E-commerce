import {
  Menu,
  MenuDropdown,
  MenuItem,
  MenuTarget,
  UnstyledButton,
} from "@mantine/core";
import Link from "next/link";
import { FaArrowDown } from "react-icons/fa6";

const MenuCategory = ({
  categories,
}: {
  categories: {
    slug: string;
    name: string;
  }[];
}) => {
  return (
    <Menu
      trigger="click-hover"
      openDelay={100}
      closeDelay={400}
      transitionProps={{ duration: 300, transition: "fade" }}
    >
      <MenuTarget>
        <UnstyledButton className="group relative text-black hover:text-blue-400 cursor-pointer transition-all ease-in-out">
          <span className="flex flex-row items-center gap-2">
            Shop{" "}
            <FaArrowDown className="transition-transform duration-500 group-hover:rotate-180" />
          </span>
        </UnstyledButton>
      </MenuTarget>
      <MenuDropdown className="flex flex-col gap-2">
        {categories.map((category, index) => (
          <MenuItem
            key={index}
            component={Link}
            href={"/" + category.slug}
            className="relative px-5 py-2 overflow-hidden hover:text-primary-600 transition-colors duration-500
                     before:absolute before:bottom-0 before:left-1/2 before:h-0.5 before:w-0
                     before:bg-primary-400 before:transition-all before:duration-300
                     after:absolute after:bottom-0 after:right-1/2 after:h-0.5 after:w-0
                     after:bg-primary-400 after:transition-all after:duration-300
                     hover:before:left-0 hover:before:w-1/2
                     hover:after:right-0 hover:after:w-1/2"
          >
            {category.name}
          </MenuItem>
        ))}
      </MenuDropdown>
    </Menu>
  );
};

export default MenuCategory;
