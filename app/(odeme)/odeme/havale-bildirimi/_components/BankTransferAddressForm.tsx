"use client";
import {
  BankTransferForUserAddressFormValues,
  BankTransferForUserAddressSchema,
} from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Anchor,
  Button,
  Card,
  Checkbox,
  Grid,
  InputBase,
  Select,
  Textarea,
  TextInput,
  TypographyStylesProvider,
} from "@mantine/core";
import { useCallback, useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { IMaskInput } from "react-imask";
import { BankTransferDetailProps } from "../../page";
import { useStore } from "@/store/store";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DiscountCheck } from "@/actions/user/discount-check";
import { formattedPrice } from "@/lib/format";
import { createBankTransfer } from "../_actions/BankTransfer";
import {
  GetAddresById,
  OrderNumberCheck,
} from "../_actions/BankTransferHelperActions";
import MainLoader from "@/components/MainLoader";
import BankTransferNotificationForm from "./BankTransferNotificationForm";

const BankTransferAddressForm = ({
  data,
}: {
  data: BankTransferDetailProps;
}) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [searchDistrictValue, setSearchDistrictValue] = useState("");
  const [discountPrice, setDiscountPrice] = useState(0);
  const [discount, setDiscount] = useState({
    success: false,
  });

  const [tab, setTab] = useState<1 | 2>(1);
  const items = useStore((state) => state.items);
  const totalFinalPrice = useStore((store) => store.totalFinalPrice);
  const [formStep, setFormStep] = useState<"address" | "transfer">("address");
  const searchParams = useSearchParams();
  const { push } = useRouter();
  const pathname = usePathname();
  const [orderDetails, setOrderDetails] = useState<{
    number: string | null;
    isCompleted: boolean;
  }>({
    number: null,
    isCompleted: false,
  });
  useEffect(() => {
    const discountCode = searchParams.get("discountCode");
    async function applyDiscountCode() {
      if (!discountCode) return;
      await DiscountCheck(
        discountCode,
        items.map((item) => item.variantId),
      ).then((res) => {
        if (res.success) {
          setDiscount({ success: res.success });
          if (res.discountType === "FIXED") {
            setDiscountPrice(res.discountAmount);
          } else {
            setDiscountPrice(totalFinalPrice * (res.discountAmount / 100));
          }
        } else {
          setDiscountPrice(0);
          setDiscount({ success: false });
          const params = new URLSearchParams(searchParams);
          params.delete("discountCode");
          push(`?${params.toString()}`);
        }
      });
    }
    applyDiscountCode();
  }, [searchParams, items, totalFinalPrice, push]);

  const {
    control,
    setValue,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BankTransferForUserAddressFormValues>({
    resolver: zodResolver(BankTransferForUserAddressSchema),
    defaultValues: {
      aggrements: false,
    },
  });

  const handleProvinceChange = useCallback(
    async (provinceName: string | null) => {
      setSelectedProvince(provinceName);
      setValue("city", provinceName || "", { shouldValidate: true });
      setValue("district", null);
      setDistricts([]);

      if (provinceName) {
        setLoadingDistricts(true);
        try {
          const response = await fetch(
            `https://turkiyeapi.dev/api/v1/provinces?name=${provinceName}`,
          );
          const data = await response.json();
          if (data.data && data.data[0] && data.data[0].districts) {
            const formattedDistricts = data.data[0].districts.map(
              (district) => ({
                value: district.name,
                label: district.name,
              }),
            );
            setDistricts(formattedDistricts);
          }
        } catch (error) {
          console.error("Error fetching districts:", error);
        } finally {
          setLoadingDistricts(false);
        }
      }
    },
    [setValue],
  );
  const handleDistrictChange = (districtName: string | null) => {
    setValue("district", districtName || "", { shouldValidate: true });
  };

  useEffect(() => {
    const ai = searchParams.get("ai");
    if (!ai) return;

    const fetchAddress = async () => {
      try {
        const defaultValues = await GetAddresById(ai);
        if (defaultValues) {
          // Önce il için gerekli state'leri ayarla
          setSelectedProvince(defaultValues.city);

          // İlçeleri yükle
          const response = await fetch(
            `https://turkiyeapi.dev/api/v1/provinces?name=${defaultValues.city}`,
          );
          const data = await response.json();
          if (data.data && data.data[0] && data.data[0].districts) {
            const formattedDistricts = data.data[0].districts.map(
              (district) => ({
                value: district.name,
                label: district.name,
              }),
            );
            setDistricts(formattedDistricts);
          }

          // İlçeler yüklendikten sonra tüm form değerlerini set et
          setValue("addressDetail", defaultValues.addressDetail);
          setValue("email", defaultValues.email);
          setValue("city", defaultValues.city);
          setValue("district", defaultValues.district);
          setValue("firstName", defaultValues.name);
          setValue("lastName", defaultValues.surname);
          setValue("phone", defaultValues.phone);
        }
      } catch (error) {
        console.error("Adres bilgileri yüklenirken hata oluştu:", error);
      }
    };
    fetchAddress();
  }, [searchParams, setValue]);
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
  // useEffect için yeni bir kontrol fonksiyonu yazalım
  useEffect(() => {
    const step = searchParams.get("step");
    const orderNo = searchParams.get("on");

    const checkOrderAndSetStep = async () => {
      if (step === "address" || !step) {
        setFormStep("address");
        return;
      }

      if (step === "transfer" && orderNo) {
        try {
          const result = await OrderNumberCheck(orderNo);
          if (!result.success) {
            // Order number geçersizse adres adımına dön
            push("/odeme/havale-bildirimi?step=address", { scroll: false });
            setFormStep("address"); // formStep'i burada güncelliyoruz
            return;
          }
          // Order number geçerliyse transfer adımına geç
          setFormStep("transfer");
          setOrderDetails({
            number: orderNo,
            isCompleted: false,
          });
        } catch (error) {
          console.error("Order check failed:", error);
          push("/odeme/havale-bildirimi?step=address", { scroll: false });
          setFormStep("address");
        }
      }
    };
    checkOrderAndSetStep();
  }, [searchParams, push]);
  const onAddressSubmit: SubmitHandler<
    BankTransferForUserAddressFormValues
  > = async (formData) => {
    try {
      const response = await createBankTransfer({
        data: formData,
        items: items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        discountCode: discount.success ? searchParams.get("discountCode") : "",
      });

      if (response.success) {
        setOrderDetails({
          number: response.orderNumber,
          isCompleted: false,
        });
        setFormStep("transfer");
        push(`${pathname}?step=transfer&on=${response.orderNumber}`, {
          scroll: false,
        });
      } else {
        setError("root", { message: response.message });
      }
    } catch (error) {
      setError("root", { message: "Beklenmeyen bir hata oluştu" });
    }
  };
  if (isSubmitting) return <MainLoader />;
  return (
    <div className="grid min-h-[55vh] lg:grid-cols-2">
      <Card withBorder shadow="sm" padding={"sm"} radius={"sm"}>
        <TypographyStylesProvider>
          <div
            dangerouslySetInnerHTML={{
              __html: data?.description,
            }}
          />
        </TypographyStylesProvider>
      </Card>
      <Card
        withBorder
        shadow="sm"
        padding={"sm"}
        radius={"sm"}
        className="h-full w-full"
      >
        {formStep == "address" ? (
          <div className="space-y-4">
            <div className="">
              Toplam Tutar: {formattedPrice(totalFinalPrice - discountPrice)}
            </div>
            <form onSubmit={handleSubmit(onAddressSubmit)}>
              <Grid>
                <Grid.Col span={6}>
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
                <Grid.Col span={6}>
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
                <Grid.Col span={6}>
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
                <Grid.Col span={6}>
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
                            .replace(/\D/g, "")
                            .slice(0, 10);

                          if (text.length === 10) {
                            const formatted = `(${text.slice(0, 3)}) ${text.slice(3, 6)} ${text.slice(6, 8)} ${text.slice(8)}`;
                            field.onChange(formatted);
                          }
                        }}
                      />
                    )}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        radius={0}
                        placeholder="İl seçiniz"
                        data={provinces}
                        error={errors.city?.message}
                        disabled={loadingProvinces}
                        searchable
                        searchValue={searchValue}
                        onSearchChange={(value) => {
                          if (!value) {
                            setSearchValue("");
                            return;
                          }
                          const turkishChars = {
                            i: "İ",
                            ı: "I",
                            ç: "Ç",
                            ş: "Ş",
                            ğ: "Ğ",
                            ü: "Ü",
                            ö: "Ö",
                          };

                          const firstChar = value.charAt(0);
                          const upperFirstChar =
                            turkishChars[firstChar] || firstChar.toUpperCase();
                          const capitalizedValue =
                            upperFirstChar + value.slice(1).toLowerCase();
                          setSearchValue(capitalizedValue);
                        }}
                        value={selectedProvince}
                        onChange={(value) => {
                          field.onChange(value);
                          handleProvinceChange(value);
                        }}
                      />
                    )}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Controller
                    name="district"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        radius={0}
                        placeholder="İlçe seçiniz"
                        // onChange={handleDistrictChange} // Bu satırı kaldırın
                        value={field.value} // field.value ekleyin
                        onChange={(value) => {
                          field.onChange(value); // field.onChange kullanın
                          handleDistrictChange(value);
                        }}
                        data={districts}
                        error={errors.district?.message}
                        disabled={loadingDistricts || !selectedProvince}
                        searchable
                        searchValue={searchDistrictValue}
                        onSearchChange={(value) => {
                          if (!value) {
                            setSearchDistrictValue("");
                            return;
                          }

                          const turkishChars = {
                            i: "İ",
                            ı: "I",
                            ç: "Ç",
                            ş: "Ş",
                            ğ: "Ğ",
                            ü: "Ü",
                            ö: "Ö",
                          };
                          const firstChar = value.charAt(0);
                          const upperFirstChar =
                            turkishChars[firstChar] || firstChar.toUpperCase();
                          const capitalizedValue =
                            upperFirstChar + value.slice(1).toLowerCase();
                          setSearchDistrictValue(capitalizedValue);
                        }}
                      />
                    )}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Controller
                    name="addressDetail"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        radius={0}
                        placeholder="Adres"
                        minRows={2}
                        maxRows={4}
                        error={errors.addressDetail?.message}
                      />
                    )}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Controller
                    control={control}
                    name="aggrements"
                    render={({ field: { value, onChange, ...field } }) => (
                      <Checkbox
                        {...field}
                        size="sm"
                        error={errors.aggrements?.message}
                        checked={value}
                        onChange={(event) =>
                          onChange(event.currentTarget.checked)
                        }
                        label={
                          <div className="my-auto flex flex-wrap items-center gap-1 p-0 text-xs font-bold">
                            <Anchor
                              href="/sozlesmeler/privacypolicy"
                              c={"primary.9"}
                              fw={500}
                              td={"underline"}
                              className="underline decoration-1 transition-colors hover:text-gray-950"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Gizlilik Sözleşmesi
                            </Anchor>
                            <span> ve </span>
                            <Anchor
                              href="sozlesmeler/distancesalesagreement"
                              c={"primary.9"}
                              fw={500}
                              td={"underline"}
                              className="underline decoration-1 transition-colors hover:text-gray-950"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Satış Politikası
                            </Anchor>
                            <span> &#39;nı okudum ve kabul ediyorum</span>
                          </div>
                        }
                      />
                    )}
                  />
                </Grid.Col>
                {errors.root && (
                  <Grid.Col py={2} span={12}>
                    <p className="text-sm text-red-500">
                      {errors.root.message}
                    </p>
                  </Grid.Col>
                )}
                <Grid.Col span={12} className="mt-auto">
                  <Button type="submit" fullWidth>
                    Havale Bildirimi Adımına Geç
                  </Button>
                </Grid.Col>
              </Grid>
            </form>
          </div>
        ) : (
          <BankTransferNotificationForm orderNumber={orderDetails.number} />
        )}
      </Card>
    </div>
  );
};

export default BankTransferAddressForm;
{
  /* <Grid.Col span={12}>
              <Switch
                checked={isSameNameEnabled}
                onChange={(event) =>
                  setIsSameNameEnabled(event.currentTarget.checked)
                }
                description="Ad Soyad Aynı"
                className="w-fit"
              />
            </Grid.Col> */
}
{
  /* <Grid.Col span={6}>
              <Controller
                control={control}
                name="transferFirstName"
                render={({ field }) => (
                  <TextInput
                    {...field}
                    description="Havale Yapan Kullanıcı Ad"
                    disabled={isSameNameEnabled}
                  />
                )}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Controller
                control={control}
                name="transferLastName"
                render={({ field }) => (
                  <TextInput
                    {...field}
                    description="Havale Yapan Kullanıcı Soyad"
                    disabled={isSameNameEnabled}
                  />
                )}
              />
            </Grid.Col> */
}
