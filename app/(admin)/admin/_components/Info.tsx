"use client";
import { Alert, Button } from "@mantine/core";
import { FaInfoCircle } from "react-icons/fa";
import Link from "next/link";
import { usePathname } from "next/navigation";
const Info = () => {
  const pathname = usePathname();
  if (pathname == "/admin/ayarlar/hesap") {
    return null;
  }
  return (
    <Alert>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-4 text-red-500 lg:items-center">
          <div className="relative h-10 w-10">
            <FaInfoCircle className="h-full min-h-full w-full min-w-full" />
          </div>
          <p className="text-lg font-bold">
            Lütfen satıcı bilgilerinizi doldurunuz. Mağazanızın tam olarak
            çalışabilmesi için bu adımı tamamlamanız gerekmektedir.
          </p>
        </div>
        <Button
          className="relative w-full md:w-40"
          component={Link}
          href={"/admin/ayarlar/hesap"}
        >
          Düzenle
        </Button>
      </div>
    </Alert>
  );
};

export default Info;
