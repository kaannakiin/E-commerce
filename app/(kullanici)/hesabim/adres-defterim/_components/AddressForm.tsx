"use client";
import { AddressFormValues, addressSchema } from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  InputBase,
  Select,
  Textarea,
  TextInput,
  Grid,
} from "@mantine/core";
import { getSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { IMaskInput } from "react-imask";
import { EditAddressUser, SaveAddressUser } from "../_actions/AddressActions";
import FeedbackDialog from "@/components/FeedbackDialog";
import { useRouter } from "next/navigation";
interface Address {
  id: string;
  name: string;
  surname: string;
  phone: string;
  city: string;
  district: string;
  addressDetail: string;
  addressTitle: string;
}
interface AddressFormProps {
  email: string;
  defaultValues?: Address;
  onClose?: () => void;
  type?: "add" | "edit";
}
const AddressForm = ({
  email,
  defaultValues,
  onClose,
  type = "add",
}: AddressFormProps) => {
  const [provinces, setProvinces] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [districts, setDistricts] = useState([]);
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });
  const { refresh } = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          surname: defaultValues.surname, // Bunu ekleyelim
          phone: defaultValues.phone,
          city: defaultValues.city,
          district: defaultValues.district,
          addressBook: defaultValues.addressDetail,
          addressTitle: defaultValues.addressTitle,
        }
      : undefined,
  });

  useEffect(() => {
    const loadInitialData = async () => {
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

        if (defaultValues?.city) {
          setSelectedProvince(defaultValues.city);
          setLoadingDistricts(true);

          const districtResponse = await fetch(
            `https://turkiyeapi.dev/api/v1/provinces?name=${defaultValues.city}`,
          );
          const districtData = await districtResponse.json();

          if (districtData.data?.[0]?.districts) {
            const formattedDistricts = districtData.data[0].districts.map(
              (district) => ({
                value: district.name,
                label: district.name,
              }),
            );
            setDistricts(formattedDistricts);
            setValue("district", defaultValues.district, {
              shouldValidate: false,
            });
            // Validation'ı daha sonra tetikle
            setTimeout(() => trigger("district"), 100);
          }
          setLoadingDistricts(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoadingProvinces(false);
      }
    };

    loadInitialData();
  }, [defaultValues, setValue, trigger]);
  const handleProvinceChange = React.useCallback(
    async (provinceName: string | null) => {
      setSelectedProvince(provinceName);
      setValue("city", provinceName || "", { shouldValidate: true });
      setValue("district", "", { shouldValidate: true });
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
  useEffect(() => {
    if (defaultValues) {
      setSelectedProvince(defaultValues.city);
      handleProvinceChange(defaultValues.city);
      setValue("district", defaultValues.district, {
        shouldValidate: false,
      });
    }
  }, [defaultValues, handleProvinceChange, setValue]);

  const onSubmitForm: SubmitHandler<AddressFormValues> = async (data) => {
    try {
      const action =
        type === "edit"
          ? EditAddressUser({ ...data, email, id: defaultValues?.id })
          : SaveAddressUser({ ...data, email });

      await action.then((res) => {
        if (res.success) {
          setDialogState({
            isOpen: true,
            message: res.message,
            type: "success",
          });
          refresh();
          onClose();
        } else {
          setDialogState({
            isOpen: true,
            message: res.message,
            type: "error",
          });
        }
      });
    } catch (error) {
      setDialogState({
        isOpen: true,
        message: "Bir hata oluştu",
        type: "error",
      });
    }
  };
  return (
    <div className="my-4">
      <form className="my-2" onSubmit={handleSubmit(onSubmitForm)}>
        <Grid gutter="md">
          {/* Ad ve Soyad */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              {...register("name")}
              label="Ad"
              withAsterisk
              className="w-full"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              {...register("surname")}
              label="Soyad"
              withAsterisk
              className="w-full"
            />
          </Grid.Col>

          {/* İl ve İlçe */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              {...register("city")}
              radius={0}
              label="İl"
              withAsterisk
              data={provinces}
              error={errors.city?.message}
              disabled={loadingProvinces}
              onChange={handleProvinceChange}
              searchable
              value={selectedProvince}
              className="w-full"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              {...register("district")}
              label="İlçe"
              data={districts}
              withAsterisk
              error={errors.district?.message}
              disabled={loadingDistricts || !selectedProvince}
              onChange={(value) => {
                setValue("district", value || "", {
                  shouldValidate: true,
                });
              }}
              value={watch("district")}
              searchable
              className="w-full"
            />
          </Grid.Col>

          {/* Adres Başlığı ve Telefon */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              {...register("addressTitle")}
              label="Adres Başlığı"
              withAsterisk
              className="w-full"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <InputBase
              {...register("phone")}
              component={IMaskInput}
              error={errors.phone?.message}
              {...(defaultValues && { value: defaultValues.phone })}
              onChange={(e) => {
                setValue("phone", e.currentTarget.value);
              }}
              withAsterisk
              mask={"(000) 000 00 00"}
              label="Telefon Numarası"
              className="w-full"
            />
          </Grid.Col>

          {/* Adres */}
          <Grid.Col span={12}>
            <Textarea
              {...register("addressBook")}
              label="Adres"
              error={errors.addressBook?.message}
              withAsterisk
              className="w-full"
            />
          </Grid.Col>

          {/* Onay Butonu */}
          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <Button type="submit" loading={isSubmitting} className="w-full">
              Onayla
            </Button>
          </Grid.Col>
        </Grid>
      </form>
      <FeedbackDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
        message={dialogState.message}
        type={dialogState.type}
      />
    </div>
  );
};

export default AddressForm;
