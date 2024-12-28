import { Button, Card, Divider, TabsList } from "@mantine/core";
import React from "react";
import TabList from "./_components/TabList";
import Link from "next/link";

const EmailPageTable = () => {
  return (
    <div className="space-y-4 p-10">
      <Card
        withBorder
        shadow="md"
        className="flex flex-row items-center justify-between"
      >
        <div className="flex flex-col space-y-1">
          <h1 className="text-xl font-bold">E-posta Ayarları</h1>
          <p className="mt-2 text-sm text-gray-500">
            Sipariş aldığınızda, kargo gönderildiğinde müşterinizi nasıl
            bilgilendirmek istediğinize dair ayarları buradan yapabilirsiniz.
          </p>
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
