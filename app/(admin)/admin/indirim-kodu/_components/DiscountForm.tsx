"use client";
import FeedbackDialog from "@/components/FeedbackDialog";
import {
  AddDiscountCodeSchema,
  AddDiscountCodeSchemaType,
} from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Group,
  MultiSelect,
  NumberInput,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { DiscountType, VariantType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { FaTurkishLiraSign } from "react-icons/fa6";
import {
  FiBox,
  FiCalendar,
  FiHash,
  FiPackage,
  FiPercent,
  FiTag,
} from "react-icons/fi";
import { createNewDiscountCode } from "../_actions/createNewDiscountCode";

interface DiscountFormProps {
  variants: {
    id: string;
    product: {
      name: string;
    };
    type: VariantType;
    unit: string;
    value: string;
  }[];
}

const DiscountForm = ({ variants }: DiscountFormProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogType, setDialogType] = useState<"success" | "error">("success");
  const router = useRouter();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddDiscountCodeSchemaType>({
    resolver: zodResolver(AddDiscountCodeSchema),
    defaultValues: {
      code: "",
      discountAmount: 0,
      discountType: DiscountType.FIXED,
      active: true,
      allProducts: true,
      hasLimit: false,
      hasExpiryDate: false,
      limit: null,
      expiresAt: null,
      variants: [],
    },
  });

  const allProducts = watch("allProducts");
  const discountType = watch("discountType");
  const hasLimit = watch("hasLimit");
  const hasExpiryDate = watch("hasExpiryDate");

  const onSubmit: SubmitHandler<AddDiscountCodeSchemaType> = async (data) => {
    try {
      const formData = new FormData();
      formData.append("code", data.code.trim());
      formData.append("discountType", data.discountType);
      formData.append("discountAmount", data.discountAmount.toString());
      formData.append("active", data.active ? "1" : "0");
      formData.append("allProducts", data.allProducts ? "1" : "0");
      formData.append("hasLimit", data.hasLimit ? "1" : "0");
      formData.append("hasExpiryDate", data.hasExpiryDate ? "1" : "0");

      if (data.hasLimit && data.limit !== null) {
        formData.append("limit", data.limit.toString());
      }

      if (data.hasExpiryDate && data.expiresAt) {
        const formattedDate = new Date(data.expiresAt).toISOString();
        formData.append("expiresAt", formattedDate);
      }

      if (!data.allProducts && data.variants.length > 0) {
        formData.append("variants", JSON.stringify(data.variants));
      }

      const response = await createNewDiscountCode(formData);

      setDialogType(response.success ? "success" : "error");
      setDialogMessage(response.message);
      setDialogOpen(true);

      if (response.success) {
        router.push("/admin/indirim-kodu");
      }
    } catch (error) {
      console.error("Form gönderimi sırasında hata:", error);
      setDialogType("error");
      setDialogMessage("İndirim kuponu oluşturulurken bir hata oluştu.");
      setDialogOpen(true);
    }
  };

  const variantOptions = variants.map((variant) => ({
    value: variant.id,
    label: `${variant.product.name} - ${variant.type} ${variant.value}${variant.unit !== null ? variant.unit : ""}`,
    type: variant.type,
    color: variant.type === VariantType.COLOR ? variant.value : null,
    displayValue: variant.value,
    unit: variant.unit,
    productName: variant.product.name,
  }));

  const CustomOption = ({ option }) => (
    <Group gap="xs">
      {option.type === VariantType.COLOR ? (
        <Box
          style={{
            width: 16,
            height: 16,
            borderRadius: "4px",
            backgroundColor: option.color,
            border: "1px solid #e0e0e0",
          }}
        />
      ) : option.type === VariantType.SIZE ? (
        <Box
          style={{
            width: 16,
            height: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FiPackage size={14} />
        </Box>
      ) : (
        <Box
          style={{
            width: 16,
            height: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FiBox size={14} />
        </Box>
      )}
      <div>
        <Text size="sm" fw={500}>
          {option.productName}
        </Text>
        <Text size="xs" c="dimmed">
          {option.displayValue}
          {option.unit}
        </Text>
      </div>
    </Group>
  );

  return (
    <Fragment>
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-2xl p-6">
        <Stack gap="md">
          {/* Existing form fields remain the same */}
          <Controller
            name="hasLimit"
            control={control}
            render={({ field: { value, onChange, ...rest } }) => (
              <Switch
                {...rest}
                label="Kullanım Limiti Belirle"
                checked={value}
                onChange={(event) => onChange(event.currentTarget.checked)}
                error={errors.hasLimit?.message?.toString()}
              />
            )}
          />

          {hasLimit && (
            <Controller
              name="limit"
              control={control}
              render={({ field: { onChange, value, ...rest } }) => (
                <NumberInput
                  {...rest}
                  value={value === null ? "" : value}
                  onChange={(val) => {
                    onChange(val === undefined || val === "" ? null : val);
                  }}
                  label="Kullanım Limiti"
                  placeholder="Limit giriniz"
                  min={1}
                  hideControls={true}
                  description="Kuponun kaç kez kullanılabileceğini belirleyin."
                  leftSection={<FiHash className="text-gray-500" />}
                  error={errors.limit?.message?.toString()}
                  withAsterisk
                />
              )}
            />
          )}

          <Controller
            name="hasExpiryDate"
            control={control}
            render={({ field: { value, onChange, ...rest } }) => (
              <Switch
                {...rest}
                label="Son Kullanım Tarihi Belirle"
                checked={value}
                onChange={(event) => onChange(event.currentTarget.checked)}
              />
            )}
          />

          {hasExpiryDate && (
            <Controller
              name="expiresAt"
              control={control}
              render={({ field }) => (
                <DateInput
                  {...field}
                  label="Son Kullanım Tarihi"
                  placeholder="Tarih seçin"
                  description="Kuponun son kullanım tarihini belirleyin."
                  leftSection={<FiCalendar className="text-gray-500" />}
                  error={errors.expiresAt?.message?.toString()}
                  locale="tr"
                  minDate={new Date()}
                  withAsterisk
                />
              )}
            />
          )}

          <Controller
            name="code"
            control={control}
            render={({ field: { onChange, ...rest } }) => (
              <TextInput
                {...rest}
                onChange={(event) => {
                  onChange(event.currentTarget.value.toUpperCase());
                }}
                label="Kupon Kodu"
                placeholder="ABC123"
                error={errors.code?.message}
                leftSection={<FiTag className="text-gray-500" />}
                withAsterisk
                styles={{
                  input: {
                    textTransform: "uppercase",
                  },
                }}
                onPaste={(event) => {
                  event.preventDefault();
                  const pastedText = event.clipboardData.getData("text");
                  onChange(pastedText.toUpperCase());
                }}
              />
            )}
          />

          <Controller
            name="discountType"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label="İndirim Tipi"
                withAsterisk
                data={[
                  { value: DiscountType.FIXED, label: "Sabit Tutar (TL)" },
                  { value: DiscountType.PERCENTAGE, label: "Yüzdelik (%)" },
                ]}
                leftSection={<FiPercent className="text-gray-500" />}
                error={errors.discountType?.message}
              />
            )}
          />

          <Controller
            name="discountAmount"
            control={control}
            render={({ field: { onChange, ...rest } }) => (
              <NumberInput
                {...rest}
                withAsterisk
                onChange={(val) => onChange(val || 0)}
                label="İndirim Tutarı"
                placeholder={
                  discountType === DiscountType.PERCENTAGE ? "10" : "100"
                }
                leftSection={
                  discountType === DiscountType.PERCENTAGE ? (
                    <FiPercent className="text-gray-500" />
                  ) : (
                    <FaTurkishLiraSign className="text-gray-500" />
                  )
                }
                max={
                  discountType === DiscountType.PERCENTAGE
                    ? 100
                    : Number.MAX_SAFE_INTEGER
                }
                min={0}
                error={errors.discountAmount?.message?.toString()}
              />
            )}
          />

          <Controller
            name="active"
            control={control}
            render={({ field: { value, onChange, ...rest } }) => (
              <Switch
                {...rest}
                label="Kupon Aktif Mi?"
                onLabel="Aktif"
                size="lg"
                offLabel="Pasif"
                checked={value}
                onChange={(event) => onChange(event.currentTarget.checked)}
              />
            )}
          />

          <Controller
            name="allProducts"
            control={control}
            render={({ field: { value, onChange, ...rest } }) => (
              <Switch
                {...rest}
                label="Tüm Ürünlerde Geçerli Mi?"
                size="lg"
                onLabel="Evet"
                offLabel="Hayır"
                checked={value}
                onChange={(event) => onChange(event.currentTarget.checked)}
              />
            )}
          />

          {!allProducts && (
            <Controller
              name="variants"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  {...field}
                  label="İndirim Uygulanacak Ürünler"
                  data={variantOptions}
                  leftSection={<FiBox className="text-gray-500" />}
                  error={errors.variants?.message?.toString()}
                  renderOption={({ option }) => (
                    <CustomOption option={option} />
                  )}
                  searchable
                  clearable
                  placeholder="Ürün seçiniz"
                />
              )}
            />
          )}

          <Group justify="flex-end" mt="xl">
            <Button type="submit" loading={isSubmitting} size="md">
              {isSubmitting ? "Kaydediliyor..." : "İndirim Kuponu Oluştur"}
            </Button>
          </Group>
        </Stack>
      </form>

      <FeedbackDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        message={dialogMessage}
        type={dialogType}
        autoCloseDelay={2000}
      />
    </Fragment>
  );
};

export default DiscountForm;
