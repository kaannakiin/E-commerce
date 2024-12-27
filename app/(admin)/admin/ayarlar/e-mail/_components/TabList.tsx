"use client";
import { Paper, Tabs } from "@mantine/core";
import { EmailTemplateType } from "@prisma/client";
import Link from "next/link";
import React from "react";
import { CiMail } from "react-icons/ci";

const TabList = () => {
  return (
    <Tabs defaultValue="orders" variant="pills" color="gray">
      <Tabs.List>
        <Tabs.Tab value="orders">Siparişler</Tabs.Tab>
        <Tabs.Tab value="ship">Kargo</Tabs.Tab>
        <Tabs.Tab value="refunds">İadeler</Tabs.Tab>
        <Tabs.Tab value="user">Müşteri</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="orders" className="py-2">
        <Card
          value={EmailTemplateType.ORDER_CANCELLED}
          title="Sipariş İptal Edildi"
          text="Siparişin iptal edilmesi durumunda müşteriye gönderilir."
        />
        <Card
          value={EmailTemplateType.ORDER_CREATED}
          title="Sipariş Oluşturuldu"
          text="Müşteri, siparişini verdikten sonra müşteriye gönderilir."
        />
        <Card
          value={EmailTemplateType.ORDER_INVOICE}
          title="Sipariş Faturası"
          text="Entegrasyonlardan oluşan fatura oluştuğunda müşteriye gönderilir."
        />
        <Card
          value={EmailTemplateType.ORDER_DELIVERED}
          title="Sipariş Teslim Edildi"
          text="Sipariş teslim edildi durumuna geçtiğinde müşteriye gönderilir."
        />
      </Tabs.Panel>
      <Tabs.Panel value="ship" className="py-2">
        <Card
          value={EmailTemplateType.SHIPPING_CREATED}
          title="Kargo Oluşturuldu"
          text="Kargo oluşturulduğunda müşteriye gönderilir."
        />
        <Card
          value={EmailTemplateType.SHIPPING_DELIVERED}
          title="Kargo Teslim Edildi"
          text="Kargo teslim edildiğinde müşteriye gönderilir."
        />
      </Tabs.Panel>
      <Tabs.Panel value="refunds" className="py-2">
        <Card
          value={EmailTemplateType.ORDER_REFUNDED}
          title="Sipariş İade Edildi"
          text="Müşterinin siparişi için para iadesi yapılırsa müşteriye gönderilir."
        />
        <Card
          value={EmailTemplateType.REFUND_REQUESTED}
          title="İade Talep Edildi"
          text="Müşteri, siparişin iade talebinde bulunduysa müşteriye gönderilir."
        />
        <Card
          value={EmailTemplateType.REFUND_REJECTED}
          title="İade Talebi Reddedildi"
          text="Müşterinin iade talebi reddedilirse müşteriye gönderilir."
        />
      </Tabs.Panel>
      <Tabs.Panel value="user" className="py-2">
        <Card
          value={EmailTemplateType.PASSWORD_RESET}
          title="Şifre Sıfırlama"
          text="Müşteri, hesap parolasını sıfırlamak istediğinde müşteriye gönderilir."
        />
        <Card
          value={EmailTemplateType.WELCOME_MESSAGE}
          title="Müşteri Hoş Geldin Mesajı"
          text="Müşteri, ilk hesap oluşturduğunda kendisine otomatik olarak gönderilir."
        />
      </Tabs.Panel>
    </Tabs>
  );
};

export default TabList;
interface CardProps {
  title: string;
  text: string;
  value?: string;
}

const Card: React.FC<CardProps> = ({ title, text, value }) => {
  return (
    <Paper
      component={Link}
      href={`/admin/ayarlar/e-mail/${value}`}
      className="flex min-h-[4rem] flex-col items-start gap-3 border border-gray-200 bg-white p-3 sm:h-16 sm:flex-row sm:items-center sm:gap-4 sm:p-2"
    >
      <div className="relative flex h-10 w-10 items-center justify-center bg-gray-50 sm:h-12 sm:w-12">
        <CiMail size={24} />
      </div>
      <div className="flex flex-1 flex-col py-1 sm:py-2">
        <h4 className="sm:text-md text-sm font-semibold text-gray-800">
          {title}
        </h4>
        <p className="text-xs text-gray-600 sm:text-sm">{text} </p>
      </div>
    </Paper>
  );
};
