import { signOut } from "@/auth";
import { Avatar, Button, Group, Paper, Stack, Title } from "@mantine/core";
import Link from "next/link";
import { CiHeart } from "react-icons/ci";
import { FaAddressCard, FaSignOutAlt } from "react-icons/fa";
import { MdPersonalInjury } from "react-icons/md";
import { FaRegHeart } from "react-icons/fa";

function capitalizeWords(name) {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const Navbar = ({ session }) => {
  return (
    <Stack className="h-full w-full lg:w-1/4 2xl:w-1/6" gap="md">
      <Paper shadow="sm" p="md" radius="md">
        <Group align="center" mb="xs">
          <Avatar radius="xl" />
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
          <Button
            type="submit"
            fullWidth
            leftSection={<FaSignOutAlt />}
            variant="transparent"
            c="red"
          >
            Çıkış Yap
          </Button>
        </form>
      </Paper>

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
            variant="filled"
            href={"/hesabim/adres-defterim"}
            leftSection={<FaAddressCard className="font-bold" size={20} />}
            fullWidth
            classNames={{
              inner:
                "flex flex-row items-center  pl-1  justify-start gap-4 w-full",
            }}
          >
            Adres Defterim
          </Button>

          <Button
            component={Link}
            href={"/hesabim/siparislerim"}
            leftSection={<MdPersonalInjury className="font-bold" size={20} />}
            fullWidth
            classNames={{
              inner:
                "flex flex-row items-center  pl-1  justify-start gap-4 w-full",
            }}
          >
            Siparişlerim
          </Button>

          <Button
            component={Link}
            href={"/hesabim/favoriler"}
            leftSection={<FaRegHeart className="font-bold" size={20} />}
            fullWidth
            classNames={{
              inner:
                "flex flex-row items-center  pl-1  justify-start gap-4 w-full",
            }}
          >
            Favorilerim
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default Navbar;
