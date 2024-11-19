import { Params, SearchParams } from "@/types/types";
import DiscountTable from "./_components/DiscountTable";
import Link from "next/link";
import { Button, Group, Title } from "@mantine/core";
import { FiPlus, FiClock, FiCheckCircle } from "react-icons/fi";

const DiscountTablePage = async (props: {
  params: Params;
  searchParams: SearchParams;
}) => {
  const sp = await props.searchParams;
  const type = (sp.type as string) === "expired" ? "expired" : "unexpired";

  return (
    <div className="flex w-full flex-col space-y-6 p-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-5">
        <Title order={2} className="text-gray-800">
          İndirim Kuponları Yönetimi
        </Title>
      </div>

      <Group className="flex flex-wrap gap-3">
        <Button
          component={Link}
          href="/admin/indirim-kodu/yeni"
          leftSection={<FiPlus size={18} />}
          variant="filled"
          className="bg-gradient-to-r from-blue-600 to-blue-700 transition-all duration-200 hover:from-blue-700 hover:to-blue-800"
          size="md"
        >
          Yeni Kupon Oluştur
        </Button>

        <Button
          component={Link}
          href="/admin/indirim-kodu?type=unexpired"
          leftSection={<FiCheckCircle size={18} />}
          variant={type === "unexpired" ? "filled" : "light"}
          color="green"
          className={`transition-all duration-200 ${
            type === "unexpired"
              ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              : "hover:bg-green-50"
          }`}
          size="md"
        >
          Aktif Kuponlar
        </Button>

        <Button
          component={Link}
          href="/admin/indirim-kodu?type=expired"
          leftSection={<FiClock size={18} />}
          variant={type === "expired" ? "filled" : "light"}
          color="red"
          className={`transition-all duration-200 ${
            type === "expired"
              ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              : "hover:bg-red-50"
          }`}
          size="md"
        >
          Süresi Dolmuş Kuponlar
        </Button>
      </Group>

      <div className="mt-6">
        <DiscountTable type={type} />
      </div>
    </div>
  );
};

export default DiscountTablePage;
