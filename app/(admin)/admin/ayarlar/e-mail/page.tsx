import { Button, Card, Divider } from "@mantine/core";
import Link from "next/link";
import TabList from "./_components/TabList";
import { IoMailOutline } from "react-icons/io5";

const EmailPageTable = () => {
  return (
    <div className="space-y-4 p-10">
      <Card
        withBorder
        shadow="md"
        className="flex flex-row items-center justify-between"
      >
        <div className="flex items-start space-x-4">
          <div className="rounded-lg bg-blue-50 p-2">
            <IoMailOutline className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex flex-col space-y-1">
            <h1 className="text-2xl font-semibold text-gray-900">
              E-posta Şablonları
            </h1>
            <div className="mt-2 space-y-3">
              <p className="text-base text-gray-600">
                Müşterilerinizle otomatik iletişiminizi özelleştirin.
                Siparişler, kargolar ve önemli güncellemeler için e-posta
                şablonlarını burada düzenleyebilirsiniz.
              </p>
              <div className="rounded-md bg-blue-50 p-4">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Not:</span> Header ve Footer
                  içerikleri satıcı profilinizden alınmaktadır. Bu bölümde
                  sadece e-posta gövdesini özelleştirebilirsiniz.
                </p>
              </div>
            </div>
          </div>
        </div>
        <Button
          component={Link}
          href={"/admin/ayarlar/e-mail/email-settings"}
          variant="outline"
          color="gray"
        >
          E-Posta Ayarları Düzenle
        </Button>
      </Card>
      <Card withBorder shadow="md" padding={"xl"}>
        <h2 className="font-bold">Bildirimler</h2>
        <p className="text-sm text-gray-500">
          Bildirimler E-posta bildirimlerinizi kendi markanız ve içeriğinizle
          özelleştirin
        </p>
        <Divider size={"xs"} my={"md"} />
        <TabList />
      </Card>
    </div>
  );
};

export default EmailPageTable;
