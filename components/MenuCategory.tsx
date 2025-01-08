import {
  Menu,
  MenuDropdown,
  MenuItem,
  MenuTarget,
  UnstyledButton,
} from "@mantine/core";
import Link from "next/link";

interface IMenuCategoryProps {
  MenuName: string;
  isDropDown?: boolean;
  MenuData?: {
    name: string;
    slug: string;
  }[];
  slug?: string;
}

const MenuCategory = ({
  MenuName,
  isDropDown = true,
  MenuData,
  slug,
}: IMenuCategoryProps) => {
  if (!isDropDown) {
    return (
      <Link
        href={slug}
        className="group relative inline-block px-2 py-2 text-lg text-black transition-colors duration-300 hover:text-[var(--mantine-color-primary-6)]"
      >
        <span className="flex items-center gap-2">
          {MenuName}
          <span className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-[var(--mantine-color-primary-6)] transition-all duration-300 group-hover:w-full" />
        </span>
      </Link>
    );
  }

  return (
    <Menu
      trigger="click-hover"
      closeDelay={200}
      transitionProps={{ duration: 500, transition: "fade" }}
    >
      <MenuTarget>
        <UnstyledButton className="group relative px-2 py-2 text-lg text-black transition-colors duration-300 hover:text-[var(--mantine-color-primary-6)]">
          <span className="flex items-center gap-2">
            {MenuName}
            <span className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-[var(--mantine-color-primary-6)] transition-all duration-300 group-hover:w-full" />
          </span>
        </UnstyledButton>
      </MenuTarget>
      <MenuDropdown className="flex flex-col gap-2">
        {MenuData?.map((category, index) => (
          <MenuItem
            key={index}
            component={Link}
            href={"/categories/" + category.slug}
            className="relative overflow-hidden px-5 py-2 font-semibold text-black transition-colors duration-500 before:absolute before:bottom-0 before:left-1/2 before:h-0.5 before:w-0 before:bg-[var(--mantine-color-primary-6)] before:transition-all before:duration-500 after:absolute after:bottom-0 after:right-1/2 after:h-0.5 after:w-0 after:bg-[var(--mantine-color-primary-6)] after:transition-all after:duration-500 hover:text-[var(--mantine-color-primary-6)] hover:before:left-0 hover:before:w-1/2 hover:after:right-0 hover:after:w-1/2"
          >
            {category.name}
          </MenuItem>
        ))}
      </MenuDropdown>
    </Menu>
  );
};

export default MenuCategory;
