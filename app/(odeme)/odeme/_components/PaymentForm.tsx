"use client";
import { fetchWrapper } from "@/lib/fetchWrapper";
import { useStore } from "@/store/store";
import {
  CreditCardFormValues,
  CreditCardSchema,
} from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Checkbox,
  Grid,
  InputBase,
  Modal,
  Paper,
  Select,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { IMaskInput } from "react-imask";

const PaymentForm = ({ address }) => {
  const items = useStore((state) => state.items);
  const clearCart = useStore((state) => state.clearCart);
  const searchParams = useSearchParams();
  const [opened, { open, close }] = useDisclosure(false);
  const [threeDHTML, setThreeDHTML] = useState<string>("");
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    setError,
  } = useForm<CreditCardFormValues>({
    resolver: zodResolver(CreditCardSchema),
    defaultValues: {
      privacyAccepted: true,
    },
  });
  const router = useRouter();
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.status === "error") {
        close();
        setError("root", {
          message: event.data.message || "Ödeme işlemi başarısız oldu.",
        });
      }
      if (event.data?.status === "success") {
        clearCart();
        close();
        router.push(event.data.redirectUrl);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [close, router, setError, clearCart]);

  const onSubmit: SubmitHandler<CreditCardFormValues> = async (data) => {
    const binCheckResponse = await fetchWrapper.post(
      "/user/payment/bin-check",
      {
        binNumber: data.cardNumber.replace(/\s/g, "").slice(0, 6),
      },
    );
    if (binCheckResponse.error) {
      setError("cardNumber", {
        message: "Lütfen kart numaranızı kontrol edin.",
      });
      return;
    }
    const variantIdQty = items.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
    }));
    const params = searchParams.get("discountCode") || "";
    const require3DSecure =
      binCheckResponse.status === 201 || data.threeDsecure === true;
    if (require3DSecure) {
      try {
        await fetchWrapper
          .post("/user/payment/three-d-payment", {
            data,
            address,
            variantIdQty,
            params,
          })
          .then((res) => {
            if (res.status === 400) {
              setError("root", {
                message: res.data.toString(),
              });
            }
            open();
            setThreeDHTML(res.htmlContent);
          });
      } catch (error) {
        setError("root", {
          message:
            "3D ödeme işlemi başlatılırken bir hata oluştu. Lütfen tekrar deneyiniz.",
        });
      }
    }
    if (!require3DSecure) {
      await fetchWrapper
        .post("/user/payment/non-three-d-payment", {
          data,
          address,
          variantIdQty,
          params,
        })
        .then((res) => {
          if (res.status === 400) {
            setError("root", {
              message: res.error,
            });
          }
          if (res.status === 200) {
            clearCart();
            //@ts-expect-error redirectUrl
            router.push(res.data.redirectUrl as string);
          }
        });
    }
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        size="xl"
        title={<Title order={3}>3D Secure Doğrulama</Title>}
        centered
      >
        <Paper p="md">
          <iframe
            srcDoc={threeDHTML}
            style={{
              width: "100%",
              height: "500px",
              border: "none",
            }}
            sandbox="allow-forms allow-scripts allow-same-origin allow-top-navigation allow-top-navigation-by-user-activation"
          />
        </Paper>
      </Modal>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid>
          <Paper shadow="xs" p="md" withBorder>
            <Title order={3} mb="md">
              Kart Bilgileri
            </Title>
            <Grid className="my-2">
              <Grid.Col span={12}>
                <Controller
                  name="cardHolderName"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      radius={"md"}
                      size="md"
                      placeholder="Kart üzerindeki isim"
                    />
                  )}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Controller
                  name="cardNumber"
                  control={control}
                  render={({
                    field: { value, onChange, ...field },
                    fieldState: { error },
                  }) => (
                    <InputBase
                      component={IMaskInput}
                      mask="0000 0000 0000 0000"
                      placeholder="Kart Numarası"
                      value={value || ""}
                      error={error?.message}
                      radius={"md"}
                      size="md"
                      onAccept={(value) => {
                        onChange(value);
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        const text = e.clipboardData
                          .getData("text")
                          .replace(/\D/g, "")
                          .slice(0, 16);

                        if (text.length === 16) {
                          const formatted =
                            text.match(/.{1,4}/g)?.join(" ") || "";
                          onChange(formatted);
                        }
                      }}
                    />
                  )}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 4, md: 4 }}>
                <Controller
                  name="expireMonth"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      radius={"md"}
                      size="md"
                      data={[
                        "1",
                        "2",
                        "3",
                        "4",
                        "5",
                        "6",
                        "7",
                        "8",
                        "9",
                        "10",
                        "11",
                        "12",
                      ]}
                      placeholder="Ay"
                      error={errors.expireMonth?.message}
                    />
                  )}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 4, md: 4 }}>
                <Controller
                  name="expireYear"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      data={new Array(20)
                        .fill(0)
                        .map((_, index) =>
                          (new Date().getFullYear() + index).toString(),
                        )}
                      radius={"md"}
                      size="md"
                      placeholder="Yıl"
                      error={errors.expireYear?.message}
                    />
                  )}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 4, md: 4 }}>
                <Controller
                  name="cvc"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      radius={"md"}
                      size="md"
                      placeholder="CVV"
                      maxLength={3}
                      error={errors.cvc?.message}
                      onPaste={(e) => {
                        e.preventDefault();
                        const text = e.clipboardData
                          .getData("text")
                          .replace(/\D/g, "")
                          .slice(0, 3);
                        field.onChange(text);
                      }}
                    />
                  )}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Controller
                  name="threeDsecure"
                  control={control}
                  render={({ field: { value, onChange, ...field } }) => (
                    <Checkbox
                      {...field}
                      label="3D secure ile öde"
                      checked={value}
                      onChange={(event) =>
                        onChange(event.currentTarget.checked)
                      }
                    />
                  )}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Controller
                  name="privacyAccepted"
                  control={control}
                  render={({
                    field: { value, onChange, ...field },
                    fieldState: { error },
                  }) => (
                    <Checkbox
                      {...field}
                      size="sm"
                      error={error?.message}
                      checked={value}
                      onChange={(event) =>
                        onChange(event.currentTarget.checked)
                      }
                      label={
                        <div className="my-auto flex flex-wrap items-center gap-1 p-0 text-xs font-bold">
                          <a
                            href="/gizlilik-sozlesmesi"
                            className="font-medium text-primary-900 underline decoration-1 transition-colors hover:text-primary-700"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Gizlilik Sözleşmesi
                          </a>
                          <span>ve</span>
                          <a
                            href="/satis-politikasi"
                            className="font-medium text-primary-900 underline decoration-1 transition-colors hover:text-primary-700"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Satış Politikası
                          </a>
                          <span>&#39;nı okudum ve kabul ediyorum</span>
                        </div>
                      }
                    />
                  )}
                />
                {errors.root && (
                  <Text c={"red"} size="sm">
                    {errors.root.message || "Ödeme işlemi başarısız oldu."}
                  </Text>
                )}
              </Grid.Col>
            </Grid>
            <Button type="submit" loading={isSubmitting} fullWidth>
              Siparişi Tamamla
            </Button>
          </Paper>
        </Grid>
      </form>
    </>
  );
};

export default PaymentForm;
