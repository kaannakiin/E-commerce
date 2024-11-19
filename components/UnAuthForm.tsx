"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import {
  checkoutFormSchema,
  type CheckoutFormValues,
} from "@/zodschemas/authschema";
import {
  TextInput,
  Checkbox,
  Button,
  Group,
  Box,
  Card,
  Text,
  Select,
  Grid,
  Stack,
  Paper,
  Container,
  Title,
  Divider,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

const UnAuthForm = () => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      agreements: {
        termsAccepted: true,
        privacyAccepted: true,
      },
    },
  });

  const mobile = useMediaQuery("(max-width: 768px)");

  // İlleri çek
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

  // İl seçildiğinde ilçeleri çek
  const handleProvinceChange = async (provinceName: string | null) => {
    setSelectedProvince(provinceName);
    setValue("address.city", provinceName || "");
    setValue("address.district", ""); // İlçe seçimini sıfırla
    setDistricts([]); // İlçe listesini sıfırla

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
    setValue("address.district", districtName || "");
  };

  const onSubmit = async (data: CheckoutFormValues) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {}
  };

  return (
    <Container size="md" p={"md"}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <Paper>
            <Title order={3} mb="md">
              Kişisel Bilgiler
            </Title>
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  radius={0}
                  placeholder="Ad"
                  error={errors.firstName?.message}
                  {...register("firstName")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
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
                <TextInput
                  radius={0}
                  placeholder="Telefon numarası"
                  error={errors.phone?.message}
                  {...register("phone")}
                />
              </Grid.Col>
            </Grid>
          </Paper>
          <Paper>
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
                />
              </Grid.Col>
            </Grid>
          </Paper>
          <Divider />
          <Paper>
            <h1 className="my-2 text-2xl font-bold">Kart Bilgileri</h1>
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
                <TextInput
                  radius={0}
                  placeholder="Kart numarası"
                  error={errors.cardInfo?.cardNumber?.message}
                  {...register("cardInfo.cardNumber")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput
                  radius={0}
                  placeholder="Ay"
                  maxLength={2}
                  error={errors.cardInfo?.expireMonth?.message}
                  {...register("cardInfo.expireMonth")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput
                  radius={0}
                  placeholder="Yıl"
                  maxLength={2}
                  error={errors.cardInfo?.expireYear?.message}
                  {...register("cardInfo.expireYear")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput
                  radius={0}
                  placeholder="CVV"
                  maxLength={3}
                  error={errors.cardInfo?.cvc?.message}
                  {...register("cardInfo.cvc")}
                />
              </Grid.Col>
            </Grid>
          </Paper>

          <Paper>
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
          <Group justify="flex-end">
            <Button fullWidth={mobile ? true : false} type="submit">
              Siparişi Tamamla
            </Button>
          </Group>
        </Stack>
      </form>
    </Container>
  );
};

export default UnAuthForm;
