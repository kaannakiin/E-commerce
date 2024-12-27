import { signOut } from "@/auth";
import {
  Button,
  UnstyledButton,
  Paper,
  Title,
  Stack,
  Group,
} from "@mantine/core";
import Link from "next/link";
import React from "react";
import { FaSignOutAlt, FaAddressCard, FaUserCircle } from "react-icons/fa";
import { MdPersonalInjury } from "react-icons/md";
import { CiHeart } from "react-icons/ci";

function capitalizeWords(name) {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const Navbar = ({ session }) => {
  return (
    <Stack className="h-full w-full lg:w-1/4 2xl:w-1/6" gap="md">
      {/* Profil Kartı */}
      <Paper
        shadow="sm"
        p="md"
        radius="md"
        className="border border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50"
      >
        <Group align="center" mb="xs">
          <FaUserCircle size={24} className="text-gray-600" />
          <Title order={3} className="font-light text-gray-700">
            {capitalizeWords(session.name.trim())}
          </Title>
        </Group>
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <UnstyledButton
            type="submit"
            className="flex items-center gap-2 text-sm text-red-500 transition-colors duration-200 hover:text-red-600"
          >
            <FaSignOutAlt />
            Çıkış Yap
          </UnstyledButton>
        </form>
      </Paper>

      {/* Hesap Ayarları */}
      <Paper shadow="sm" p="md" radius="md" className="border border-gray-100">
        <Title
          order={4}
          c={"primary.7"}
          styles={{
            root: {
              marginBottom: "1rem", // mb-4
              borderBottom: "1px solid var(--mantine-color-primary-2)", // border-primary-200
              paddingBottom: "0.5rem", // pb-2
              textAlign: "center",
            },
          }}
        >
          Hesap Ayarları
        </Title>

        <Stack gap="sm">
          <Button
            component={Link}
            href={"/hesabim/adres-defterim"}
            variant="light"
            leftSection={<FaAddressCard />}
            className="transition-colors duration-200 hover:bg-blue-50"
            fullWidth
          >
            Adres Defterim
          </Button>

          <Button
            variant="light"
            component={Link}
            href={"/hesabim/siparislerim"}
            leftSection={<MdPersonalInjury />}
            className="transition-colors duration-200 hover:bg-purple-50"
            fullWidth
          >
            Siparişlerim
          </Button>

          <Button
            variant="light"
            component={Link}
            href={"/hesabim/favoriler"}
            leftSection={<CiHeart />}
            className="transition-colors duration-200 hover:bg-pink-50"
            fullWidth
          >
            Favorilerim{" "}
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default Navbar;
