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
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { IMaskInput } from "react-imask";
const CheckoutForm = () => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const items = useStore((state) => state.items);
  const searchParams = useSearchParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    watch,
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
    setValue("address.district", "", { shouldValidate: true }); // İlçe değerini sıfırla
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
      setLoading(true);
      // Kart numarasından boşlukları temizle
      data.cardInfo.cardNumber = data.cardInfo.cardNumber.replace(/\s/g, "");

      // Bin check isteği
      const binCheckResponse = await fetchWrapper.post(
        "/user/payment/bin-check",
        {
          binNumber: data.cardInfo.cardNumber.slice(0, 6),
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
          const threeDResponse = await fetchWrapper
            .post("/user/payment/three-d-payment", {
              data,
              variantIdQty,
              params,
            })
            .then((res) => {
              if (res.status === 200) {
                document.open();
                document.write(res.htmlContent);
                document.close();
              } else if (res.status === 400) {
                setError("root", {
                  message:
                    "3D ödeme işlemi başlatılırken bir hata oluştu. Lütfen tekrar deneyiniz.",
                });
              }
              setError("root", {
                message: "Beklenmedik bir hata oldu. Lütfen tekrar deneyiniz",
              });
            });
        } catch (error) {
          setError("root", {
            message:
              "3D ödeme işlemi başlatılırken bir hata oluştu. Lütfen tekrar deneyiniz.",
          });
        }
      } else {
        // Normal ödeme işlemi
        try {
          const nonThreeDResponse = await fetchWrapper.post(
            "/user/payment/non-three-d-payment",
            { data, variantIdQty, params },
          );

          if (!nonThreeDResponse || nonThreeDResponse.error) {
            throw new Error("Ödeme yanıtı alınamadı");
          }

          window.location.href = "/payment/success";
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
      setLoading(false);
    }
  };

  return (
    <Container size="md" p={0}>
      {loading ? (
        <Paper shadow="xs" p="md" withBorder>
          <Stack align="center">
            <Loader size="md" />
            <Text>
              Ödeme işleminiz gerçekleştiriliyor, lütfen bekleyiniz...
            </Text>
          </Stack>
        </Paper>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack>
            <Title order={2}>Siparişi Tamamla</Title>

            <Paper shadow="xs" p="md" withBorder>
              <Title order={3} mb="md">
                Kişisel Bilgiler
              </Title>
              <Grid>
                <Grid.Col span={{ base: 6, md: 6 }}>
                  <TextInput
                    radius={0}
                    placeholder="Ad"
                    error={errors.firstName?.message}
                    {...register("firstName")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 6, md: 6 }}>
                  <TextInput
                    radius={0}
                    placeholder="Soyad"
                    error={errors.lastName?.message}
                    {...register("lastName")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    radius={0}
                    placeholder="E-posta"
                    error={errors.email?.message}
                    {...register("email")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <InputBase
                    component={IMaskInput}
                    mask="(000) 000 00 00"
                    placeholder="Telefon Numaranız"
                    {...register("phone")} // register'ı ekleyin
                    onChange={(event) => {
                      const value = event.currentTarget.value;
                      setValue("phone", value, { shouldValidate: true });
                    }}
                    value={watch("phone") || ""} // watch ile değeri izleyin
                    error={errors.phone?.message}
                    radius={0}
                  />
                </Grid.Col>
              </Grid>
            </Paper>

            <Paper shadow="xs" p="md" withBorder>
              <Title order={3} mb="md">
                Adres Bilgileri
              </Title>
              <Grid>
                <Grid.Col span={12}>
                  <TextInput
                    radius={0}
                    placeholder="Adres"
                    error={errors.address?.street?.message}
                    {...register("address.street")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    radius={0}
                    placeholder="İl seçiniz"
                    data={provinces}
                    error={errors.address?.city?.message}
                    disabled={loadingProvinces}
                    onChange={handleProvinceChange}
                    searchable
                    value={selectedProvince}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    radius={0}
                    placeholder="İlçe seçiniz"
                    data={districts}
                    error={errors.address?.district?.message}
                    disabled={loadingDistricts || !selectedProvince}
                    onChange={handleDistrictChange}
                    searchable
                    value={watch("address.district") || ""} // watch ile form değerini izle
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
                  <TextInput
                    radius={0}
                    placeholder="Kart üzerindeki isim"
                    error={errors.cardInfo?.cardHolderName?.message}
                    {...register("cardInfo.cardHolderName")}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <InputBase
                    component={IMaskInput}
                    mask="0000 0000 0000 0000"
                    placeholder="Kart Numarası"
                    {...register("cardInfo.cardNumber")} // register'ı ekleyin
                    onChange={(event) => {
                      const value = event.currentTarget.value;
                      setValue("cardInfo.cardNumber", value, {
                        shouldValidate: true,
                      });
                    }}
                    value={watch("cardInfo.cardNumber") || ""} // watch ile değeri izleyin
                    error={errors.cardInfo?.cardNumber?.message}
                    radius={0}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 4, md: 4 }}>
                  <TextInput
                    radius={0}
                    placeholder="Ay"
                    maxLength={2}
                    error={errors.cardInfo?.expireMonth?.message}
                    {...register("cardInfo.expireMonth")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 4, md: 4 }}>
                  <TextInput
                    radius={0}
                    placeholder="Yıl"
                    maxLength={4}
                    error={errors.cardInfo?.expireYear?.message}
                    {...register("cardInfo.expireYear")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 4, md: 4 }}>
                  <TextInput
                    radius={0}
                    placeholder="CVV"
                    maxLength={3}
                    error={errors.cardInfo?.cvc?.message}
                    {...register("cardInfo.cvc")}
                  />
                </Grid.Col>
              </Grid>
              <Checkbox
                className="my-2 font-bold"
                size="xs"
                label="3D secure ile öde"
                {...register("cardInfo.threeDsecure")}
              />
            </Paper>

            <Paper shadow="xs" p="md" withBorder>
              <Title order={3} mb="md">
                Sözleşmeler
              </Title>
              <Stack>
                <Checkbox
                  label="Mesafeli satış sözleşmesini okudum ve kabul ediyorum"
                  error={errors.agreements?.termsAccepted?.message}
                  {...register("agreements.termsAccepted")}
                />
                <Checkbox
                  label="Gizlilik politikasını okudum ve kabul ediyorum"
                  error={errors.agreements?.privacyAccepted?.message}
                  {...register("agreements.privacyAccepted")}
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
      )}
    </Container>
  );
};

export default CheckoutForm;
