"use client";
import {
  Accordion,
  Button,
  Paper,
  Text,
  Title,
  TypographyStylesProvider,
} from "@mantine/core";
import { BsBank2, BsCreditCard2Front } from "react-icons/bs";
import { BankTransferDetailProps } from "../page";
import PaymentForm from "./PaymentForm";
import CheckoutForm from "./CheckoutForm";
import { useRouter, useSearchParams } from "next/navigation";

interface AccordionForPaymentProps {
  data: BankTransferDetailProps;
  defaultAddressId?: string;
}

const AccordionForPayment = ({
  data,
  defaultAddressId,
}: AccordionForPaymentProps) => {
  const searchParams = useSearchParams();
  const { push } = useRouter();

  return (
    <Paper shadow="xs" p="md" radius="md">
      <div className="space-y-4">
        <div className="mb-6">
          <Title order={3} className="mb-2 text-gray-800">
            Ödeme Yöntemi Seçiniz
          </Title>
          <Text size="sm" c="dimmed">
            Güvenli ödeme seçeneklerimizden size uygun olanı seçebilirsiniz
          </Text>
        </div>

        <Accordion variant="contained" radius="md">
          <Accordion.Item value="bankTransfer">
            <Accordion.Control icon={<BsBank2 size={20} />}>
              <div className="flex flex-col">
                <Text fw={500}>Havale / EFT</Text>
                <Text size="sm" c="dimmed">
                  Banka havalesi ile güvenli ödeme
                </Text>
                {data?.orderChange &&
                data?.orderChangeDiscountType &&
                data?.orderChangeType &&
                data?.orderChangeType === "minus" ? (
                  <Text size="sm" c="dimmed">
                    Havale ile ödeme yöntemini seçtiğiniz takdirde{" "}
                    {data.orderChangeDiscountType === "PERCENTAGE"
                      ? data.orderChange + "%"
                      : data.orderChange + " TL"}{" "}
                    indirim kazanırsınız
                  </Text>
                ) : (
                  <Text size="sm" c={"dimmed"}>
                    Havale ile ödeme yöntemini seçtiğiniz takdirde
                    {data?.orderChangeDiscountType === "PERCENTAGE"
                      ? data?.orderChange + "%"
                      : data?.orderChange + " TL"}
                    komisyon ödeyebilirsiniz.
                  </Text>
                )}
              </div>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="prose prose-blue max-w-none space-y-1">
                <TypographyStylesProvider>
                  <div
                    className="space-y-1"
                    dangerouslySetInnerHTML={{
                      __html: data?.description,
                    }}
                  />
                </TypographyStylesProvider>

                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    const params = new URLSearchParams();
                    const discountCode = searchParams.get("discountCode");
                    if (discountCode) {
                      params.set("discountCode", discountCode);
                    }
                    if (defaultAddressId) {
                      params.set("ai", defaultAddressId);
                    }
                    const baseUrl = "/odeme/havale-bildirimi";
                    const targetUrl = params.toString()
                      ? `${baseUrl}?${params.toString()}`
                      : baseUrl;
                    push(targetUrl);
                  }}
                >
                  Siparişi Tamamla
                </Button>
              </div>
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="creditCard">
            <Accordion.Control icon={<BsCreditCard2Front size={20} />}>
              <div className="flex flex-col">
                <Text fw={500}>Kredi veya Banka Kartı</Text>
                <Text size="sm" c="dimmed">
                  Tüm kartlarla güvenli ödeme
                </Text>
              </div>
            </Accordion.Control>
            <Accordion.Panel>
              {defaultAddressId ? (
                <PaymentForm address={defaultAddressId} />
              ) : (
                <CheckoutForm />
              )}
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </div>
    </Paper>
  );
};

export default AccordionForPayment;
