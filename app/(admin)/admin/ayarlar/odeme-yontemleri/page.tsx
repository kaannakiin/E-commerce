import { Button, Card } from "@mantine/core";
import Link from "next/link";
import React from "react";

const PaymentSettingsPage = () => {
  return (
    <div className="mx-auto min-h-screen max-w-[1250px] space-y-6 px-4 py-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-800">Ödeme Ekleyin</h1>
        <p className="text-gray-600">
          Ödeme yöntemlerinizi düzenleyebilir ve ödemelerinizi hızlıca almaya
          başlayabilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card withBorder padding="md" shadow="md" className="space-y-4">
          <h5 className="text-lg font-medium text-gray-800">Havale Ayarları</h5>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Banka hesap bilgilerinizi ekleyerek müşterilerinizden havale/EFT
              ile ödeme alabilirsiniz.
            </p>
            <div className="space-y-2">
              <Button
                component={Link}
                href={"/admin/ayarlar/odeme-yontemleri/havale"}
                fullWidth
                variant="outline"
                radius={"md"}
              >
                Düzenle{" "}
              </Button>
            </div>
          </div>
        </Card>

        <Card withBorder padding="md" shadow="md" className="space-y-4">
          <h5 className="text-lg font-medium text-gray-800">İyzico</h5>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              İyzico entegrasyonu ile kredi kartı ödemelerini güvenle
              alabilirsiniz. Komisyon oranı: %1.95
            </p>
            <Button
              component={Link}
              href={"/admin/ayarlar/odeme-yontemleri/iyzico"}
              fullWidth
              variant="outline" 
              radius={"md"}
            >
              Düzenle
            </Button>
          </div>
        </Card>

        <Card withBorder padding="md" shadow="md" className="space-y-4">
          <h5 className="text-lg font-medium text-gray-800">PayTR</h5>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              PayTR ile tüm kredi kartlarından 9 taksit imkanı. Komisyon oranı:
              %2.25
            </p>
            <div className="space-y-2">
              <button className="w-full rounded-md border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Ayarları Düzenle
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSettingsPage;
