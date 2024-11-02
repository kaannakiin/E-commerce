import { Button } from "@mantine/core";
import Link from "next/link";

const page = async () => {
  return (
    <div>
      <Button component={Link} href={"/admin/urunler"}>
        Ürün Ekle
      </Button>
    </div>
  );
};

export default page;
