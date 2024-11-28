"use client";
import { fetchWrapper } from "@/lib/fetchWrapper";
import { useStore } from "@/store/store";
import {
  checkoutFormSchema,
  type CheckoutFormValues,
} from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Checkbox,
  Container,
  Grid,
  InputBase,
  Loader,
  LoadingOverlay,
  Modal,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import { IMaskInput } from "react-imask";
const CheckoutForm = () => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [threeDHTML, setThreeDHTML] = useState<string>("");
  const items = useStore((state) => state.items);
  const clearCart = useStore((state) => state.clearCart);
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    control,
    setError,
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      agreements: {
        termsAccepted: true,
        privacyAccepted: true,
      },
    },
  });
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.status === "error") {
        close();
        setError("root", {
          message: event.data.message || "Ödeme işlemi başarısız oldu.",
        });
      }
      if (event.data?.status === "success") {
        clearCart(); // useStore'dan clearCart'ı eklemeyi unutmayın
        close();
        router.push(event.data.redirectUrl);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [close, router, setError, clearCart]);
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch(
          "https://turkiyeapi.dev/api/v1/provinces?fields=name",
        );
        const data = await response.json();
        const formattedProvinces = data.data.map((province) => ({
          value: province.name,
          label: province.name,
        }));
        setProvinces(formattedProvinces);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      } finally {
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, []);

  const handleProvinceChange = async (provinceName: string | null) => {
    setSelectedProvince(provinceName);
    setValue("address.city", provinceName || "", { shouldValidate: true });
    setValue("address.district", null); // İlçe değerini sıfırla
    setDistricts([]);

    if (provinceName) {
      setLoadingDistricts(true);
      try {
        const response = await fetch(
          `https://turkiyeapi.dev/api/v1/provinces?name=${provinceName}`,
        );
        const data = await response.json();
        if (data.data && data.data[0] && data.data[0].districts) {
          const formattedDistricts = data.data[0].districts.map((district) => ({
            value: district.name,
            label: district.name,
          }));
          setDistricts(formattedDistricts);
        }
      } catch (error) {
        console.error("Error fetching districts:", error);
      } finally {
        setLoadingDistricts(false);
      }
    }
  };
  const handleDistrictChange = (districtName: string | null) => {
    setValue("address.district", districtName || "", { shouldValidate: true });
  };

  const onSubmit: SubmitHandler<CheckoutFormValues> = async (
    data: CheckoutFormValues,
  ) => {
    try {
      const binCheckResponse = await fetchWrapper.post(
        "/user/payment/bin-check",
        {
          binNumber: data.cardInfo.cardNumber.replace(/\s/g, "").slice(0, 6),
        },
      );
      if (binCheckResponse.error) {
        setError("cardInfo.cardNumber", {
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
        binCheckResponse.status === 201 || data.cardInfo.threeDsecure === true;
      if (require3DSecure) {
        try {
          await fetchWrapper
            .post("/user/payment/three-d-payment", {
              data,
              variantIdQty,
              params,
            })
            .then((res) => {
              if (res.status === 400) {
                setError("root", {
                  message: res.data.toString(),
                });
              }
              if (res.status === 200) {
                // Sadece 200 durumunda modalı aç
                open();
                setThreeDHTML(res.htmlContent);
              } else {
                setError("root", {
                  message:
                    "Ödeme işlemi başarısız oldu. Lütfen tekrar deneyiniz.",
                });
              }
            });
        } catch (error) {
          setError("root", {
            message:
              "3D ödeme işlemi başlatılırken bir hata oluştu. Lütfen tekrar deneyiniz.",
          });
        }
      } else {
        try {
          const nonThreeDResponse = await fetchWrapper.post(
            "/user/payment/non-three-d-payment",
            { data, variantIdQty, params },
          );

          if (!nonThreeDResponse || nonThreeDResponse.error) {
            throw new Error("Ödeme yanıtı alınamadı");
          }
          if (nonThreeDResponse.status === 200) {
            clearCart();
            //@ts-expect-error redirectUrl
            router.push(nonThreeDResponse.data.redirectUrl);
          }
        } catch (error) {
          console.error("Normal ödeme hatası:", error);
          setError("root", {
            message:
              error.message ||
              "Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyiniz.",
          });
        }
      }
    } catch (error) {
      console.error("Genel ödeme hatası:", error);
      setError("root", {
        message:
          "Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyiniz.",
      });
    } finally {
    }
  };

  return (
    <Container size="md" p={0}>
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
        {
          <LoadingOverlay
            visible={isSubmitting}
            zIndex={1000}
            overlayProps={{ radius: "sm", blur: 2 }}
            loaderProps={{ color: "primary.9", type: "bars" }}
          />
        }
        <Stack>
          <Title order={2}>Siparişi Tamamla</Title>

          <Paper shadow="xs" p="md" withBorder>
            <Title order={3} mb="md">
              Kişisel Bilgiler
            </Title>
            <Grid>
              <Grid.Col span={{ base: 6, md: 6 }}>
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      radius={0}
                      placeholder="Ad"
                      error={errors.firstName?.message}
                      onPaste={(e) => {
                        e.preventDefault();
                        const text = e.clipboardData.getData("text");
                        field.onChange(text.trim());
                      }}
                    />
                  )}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 6, md: 6 }}>
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      radius={0}
                      placeholder="Soyad"
                      error={errors.lastName?.message}
                      onPaste={(e) => {
                        e.preventDefault();
                        const text = e.clipboardData.getData("text");
                        field.onChange(text.trim());
                      }}
                    />
                  )}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      radius={0}
                      placeholder="E-posta"
                      error={errors.email?.message}
                      onPaste={(e) => {
                        e.preventDefault();
                        const text = e.clipboardData.getData("text");
                        field.onChange(text.trim().toLowerCase());
                      }}
                    />
                  )}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <InputBase
                      component={IMaskInput}
                      mask="(000) 000 00 00"
                      placeholder="Telefon Numaranız"
                      value={field.value || ""}
                      error={errors.phone?.message}
                      radius={0}
                      onAccept={(value) => {
                        field.onChange(value);
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        const text = e.clipboardData
                          .getData("text")
                          .replace(/\D/g, "") // Sadece rakamları al
                          .slice(0, 10); // İlk 10 rakamı al

                        if (text.length === 10) {
                          const formatted = `(${text.slice(0, 3)}) ${text.slice(3, 6)} ${text.slice(6, 8)} ${text.slice(8)}`;
                          field.onChange(formatted);
                        }
                      }}
                    />
                  )}
                />
              </Grid.Col>
            </Grid>
          </Paper>

          <Paper shadow="xs" p="md" withBorder>
            <Title order={3} mb="md">
              Adres Bilgileri
            </Title>
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Controller
                  name="address.city"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      radius={0}
                      placeholder="İl seçiniz"
                      data={provinces}
                      error={errors.address?.city?.message}
                      disabled={loadingProvinces}
                      searchable
                      value={selectedProvince}
                      onChange={(value) => {
                        field.onChange(value);
                        handleProvinceChange(value);
                      }}
                    />
                  )}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Controller
                  name="address.district"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      radius={0}
                      placeholder="İlçe seçiniz"
                      onChange={handleDistrictChange}
                      data={districts}
                      error={errors.address?.district?.message}
                      disabled={loadingDistricts || !selectedProvince}
                      searchable
                    />
                  )}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Controller
                  name="address.street"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      radius={0}
                      placeholder="Adres"
                      minRows={2}
                      maxRows={4}
                      error={errors.address?.street?.message}
                      onPaste={(e) => {
                        e.preventDefault();
                        const text = e.clipboardData.getData("text");
                        field.onChange(text.trim());
                      }}
                    />
                  )}
                />
              </Grid.Col>
            </Grid>
          </Paper>

          <Paper shadow="xs" p="md" withBorder>
            <Title order={3} mb="md">
              Kart Bilgileri
            </Title>
            <Grid>
              <Grid.Col span={12}>
                <Controller
                  name="cardInfo.cardHolderName"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      radius={0}
                      placeholder="Kart üzerindeki isim"
                      error={errors.cardInfo?.cardHolderName?.message}
                      onPaste={(e) => {
                        e.preventDefault();
                        const text = e.clipboardData.getData("text");
                        field.onChange(text.trim().toUpperCase());
                      }}
                    />
                  )}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Controller
                  name="cardInfo.cardNumber"
                  control={control}
                  render={({ field }) => (
                    <InputBase
                      component={IMaskInput}
                      mask="0000 0000 0000 0000"
                      placeholder="Kart Numarası"
                      value={field.value || ""}
                      error={errors.cardInfo?.cardNumber?.message}
                      radius={0}
                      onAccept={(value) => {
                        field.onChange(value);
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
                          field.onChange(formatted);
                        }
                      }}
                    />
                  )}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 4, md: 4 }}>
                <Controller
                  name="cardInfo.expireMonth"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      radius={0}
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
                      error={errors.cardInfo?.expireMonth?.message}
                    />
                  )}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 4, md: 4 }}>
                <Controller
                  name="cardInfo.expireYear"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      data={new Array(20)
                        .fill(0)
                        .map((_, index) =>
                          (new Date().getFullYear() + index).toString(),
                        )}
                      radius={0}
                      placeholder="Yıl"
                      error={errors.cardInfo?.expireYear?.message}
                    />
                  )}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 4, md: 4 }}>
                <Controller
                  name="cardInfo.cvc"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      radius={0}
                      placeholder="CVV"
                      maxLength={3}
                      error={errors.cardInfo?.cvc?.message}
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
            </Grid>
            <Controller
              name="cardInfo.threeDsecure"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <Checkbox
                  {...field}
                  className="my-2 font-bold"
                  size="xs"
                  label="3D secure ile öde"
                  checked={value}
                  onChange={(event) => onChange(event.currentTarget.checked)}
                />
              )}
            />
          </Paper>

          <Paper shadow="xs" p="md" withBorder>
            <Title order={3} mb="md">
              Sözleşmeler
            </Title>
            <Stack>
              <Controller
                name="agreements.termsAccepted"
                control={control}
                render={({ field: { value, onChange, ...field } }) => (
                  <Checkbox
                    {...field}
                    checked={value}
                    onChange={(event) => onChange(event.currentTarget.checked)}
                    label="Mesafeli satış sözleşmesini okudum ve kabul ediyorum"
                    error={errors.agreements?.termsAccepted?.message}
                  />
                )}
              />
              <Controller
                name="agreements.privacyAccepted"
                control={control}
                render={({ field: { value, onChange, ...field } }) => (
                  <Checkbox
                    {...field}
                    checked={value}
                    onChange={(event) => onChange(event.currentTarget.checked)}
                    label="Gizlilik politikasını okudum ve kabul ediyorum"
                    error={errors.agreements?.privacyAccepted?.message}
                  />
                )}
              />
            </Stack>
          </Paper>

          {errors.root && (
            <Text color="red" mt="md">
              {errors.root.message}
            </Text>
          )}

          <Button type="submit" fullWidth radius={0}>
            Siparişi Tamamla
          </Button>
        </Stack>
      </form>
    </Container>
  );
};

export default CheckoutForm;
