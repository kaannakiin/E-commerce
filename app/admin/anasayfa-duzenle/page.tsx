import { Button } from "@mantine/core";
import Link from "next/link";

const AnasayfaDuzenlePage = () => {
  return (
    <div>
      <Button component={Link} href={"/admin/anasayfa-duzenle/main-header"}>
        Main Header
      </Button>
    </div>
  );
};

export default AnasayfaDuzenlePage;
