import {
  Menu,
  MenuDropdown,
  MenuItem,
  MenuTarget,
  UnstyledButton,
} from "@mantine/core";
import Link from "next/link";

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
      transitionProps={{ duration: 500, transition: "fade" }}
    >
      <MenuTarget>
        <UnstyledButton className="group relative cursor-pointer text-black transition-all ease-in-out hover:text-blue-400">
          <span className="flex flex-row items-center gap-2">Kategoriler</span>
        </UnstyledButton>
      </MenuTarget>
      <MenuDropdown className="flex flex-col gap-2">
        {categories.map((category, index) => (
          <MenuItem
            key={index}
            component={Link}
            href={"/categories/" + category.slug}
            className="relative overflow-hidden px-5 py-2 transition-colors duration-500 before:absolute before:bottom-0 before:left-1/2 before:h-0.5 before:w-0 before:bg-current before:transition-all before:duration-500 after:absolute after:bottom-0 after:right-1/2 after:h-0.5 after:w-0 after:bg-current after:transition-all after:duration-500 hover:opacity-80 hover:before:left-0 hover:before:w-1/2 hover:after:right-0 hover:after:w-1/2"
          >
            {category.name}
          </MenuItem>
        ))}
      </MenuDropdown>
    </Menu>
  );
};

export default MenuCategory;
