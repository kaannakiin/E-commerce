"use client";

import React, { Fragment, useState } from "react";
import {
  EditDiscountCodeSchema,
  EditDiscountCodeSchemaType,
} from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Badge,
  Box,
  Button,
  Group,
  MultiSelect,
  NumberInput,
  Paper,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { DiscountType, VariantType } from "@prisma/client";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { FaTurkishLiraSign } from "react-icons/fa6";
import {
  FiAlertCircle,
  FiBox,
  FiCalendar,
  FiClock,
  FiHash,
  FiPackage,
  FiPercent,
  FiRepeat,
  FiTag,
} from "react-icons/fi";
import { EditDiscountCode } from "../_actions/editDiscountcode";
import FeedbackDialog from "@/components/FeedbackDialog";
import { useRouter } from "next/navigation";

interface EditDiscountFormProps {
  discountCode: {
    id: string;
    code: string;
    discountType: DiscountType;
    discountAmount: number;
    uses: number;
    limit: number | null;
    expiresAt: Date | null;
    allProducts: boolean;
    createdAt: Date | null;
    variants: {
      id: string;
      product: {
        name: string;
      };
      type: VariantType;
      unit: string;
      value: string;
    }[];
  };
  allVariants: {
    id: string;
    product: {
      name: string;
    };
    type: VariantType;
    unit: string;
    value: string;
  }[];
}

const EditDiscountForm = ({
  discountCode,
  allVariants,
}: EditDiscountFormProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogType, setDialogType] = useState<"success" | "error">("success");
  const router = useRouter();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EditDiscountCodeSchemaType>({
    resolver: zodResolver(EditDiscountCodeSchema),
    defaultValues: {
      discountAmount: discountCode.discountAmount,
      discountType: discountCode.discountType,
      hasLimit: discountCode.limit !== null,
      hasExpiryDate: discountCode.expiresAt !== null,
      limit: discountCode.limit,
      expiresAt: discountCode.expiresAt
        ? new Date(discountCode.expiresAt)
        : null,
      allProducts: discountCode.allProducts,
      variants: discountCode.variants.map((v) => v.id),
    },
  });

  const allProducts = watch("allProducts");
  const discountType = watch("discountType");
  const hasLimit = watch("hasLimit");
  const hasExpiryDate = watch("hasExpiryDate");

  const onSubmit: SubmitHandler<EditDiscountCodeSchemaType> = async (data) => {
    try {
      const formData = new FormData();
      formData.append("id", discountCode.id);
      formData.append("discountType", data.discountType as DiscountType);
      formData.append("discountAmount", data.discountAmount.toString());
      formData.append("allProducts", data.allProducts ? "1" : "0");
      formData.append("hasLimit", data.hasLimit ? "1" : "0");
      formData.append("hasExpiryDate", data.hasExpiryDate ? "1" : "0");
      if (data.hasLimit) {
        formData.append("limit", data.limit?.toString());
      } else {
        formData.append("limit", null);
      }
      if (data.hasExpiryDate) {
        formData.append("expiresAt", data.expiresAt?.toISOString());
      } else {
        formData.append("expiresAt", null);
      }
      if (!data.allProducts) {
        if (data.variants && data.variants.length > 0) {
          formData.append("variants", JSON.stringify(data.variants));
        }
      }

      const response = await EditDiscountCode(formData).then((res) => res);
      setDialogType(response.success ? "success" : "error");
      setDialogMessage(response.message);
      setDialogOpen(true);
      router.push("/admin/indirim-kodu");
    } catch (error) {
      console.error("Form güncellemesi sırasında hata:", error);
      setDialogType("error");
      setDialogMessage("İndirim kuponu güncellenirken bir hata oluştu.");
      setDialogOpen(true);
    }
  };

  const variantOptions = allVariants.map((variant) => ({
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
          {discountCode.expiresAt &&
            new Date(discountCode.expiresAt) < new Date() && (
              <Alert
                variant="filled"
                color="red"
                title="Kupon Süresi Dolmuş!"
                icon={<FiAlertCircle size={20} />}
              >
                Bu kuponun kullanım süresi
                {new Date(discountCode.expiresAt).toLocaleDateString("tr-TR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                tarihinde dolmuştur.
              </Alert>
            )}

          <Paper withBorder p="md" radius="md">
            <Group gap="xl">
              <Group gap="xs">
                <FiRepeat className="text-gray-500" size={20} />
                <div>
                  <Text size="sm" fw={500} color="dimmed">
                    Kullanım Sayısı
                  </Text>
                  <Group gap="xs" align="center">
                    <div className="flex items-center gap-2 text-lg font-bold">
                      <Badge
                        size="sm"
                        color={
                          discountCode.limit &&
                          discountCode.uses >= discountCode.limit
                            ? "red"
                            : "green"
                        }
                      >
                        {discountCode.uses}
                      </Badge>
                      {discountCode.limit ? (
                        <Fragment>
                          / {discountCode.limit} kez
                          {discountCode.uses >= discountCode.limit && (
                            <Badge size="sm" color="red">
                              Limit Dolmuş!
                            </Badge>
                          )}
                        </Fragment>
                      ) : (
                        "kez (Limitsiz)"
                      )}
                    </div>
                  </Group>
                </div>
              </Group>
              <Group gap="xs">
                <FiClock className="text-gray-500" size={20} />
                <div>
                  <Text size="sm" fw={500} color="dimmed">
                    Oluşturulma Tarihi
                  </Text>
                  <Text size="lg" fw={700}>
                    {new Date(discountCode.createdAt).toLocaleDateString(
                      "tr-TR",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </Text>
                </div>
              </Group>
              <Group gap="xs">
                <FiClock className="text-gray-500" size={20} />
                <div>
                  <Text size="sm" fw={500} color="dimmed">
                    Son Kullanma Tarihi
                  </Text>
                  {discountCode.expiresAt !== null ? (
                    <Text size="lg" fw={700}>
                      {new Date(discountCode.expiresAt).toLocaleDateString(
                        "tr-TR",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </Text>
                  ) : (
                    <Text size="lg" fw={700}>
                      Limitsiz
                    </Text>
                  )}
                </div>
              </Group>
            </Group>
          </Paper>

          <TextInput
            value={discountCode.code}
            label="Kupon Kodu"
            disabled
            leftSection={<FiTag className="text-gray-500" />}
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
            name="hasLimit"
            control={control}
            render={({ field: { value, onChange, ...rest } }) => (
              <Switch
                {...rest}
                label="Kullanım Limiti Belirle"
                checked={value}
                onChange={(event) => {
                  onChange(event.currentTarget.checked);
                  if (!event.currentTarget.checked) {
                    // Switch kapatıldığında limit değerini null yap
                    setValue("limit", null);
                  }
                }}
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
                  value={value || ""}
                  onChange={(val) => onChange(val === "" ? null : val)}
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
                onChange={(event) => {
                  onChange(event.currentTarget.checked);
                  if (!event.currentTarget.checked) {
                    setValue("expiresAt", null);
                  }
                }}
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
            name="allProducts"
            control={control}
            render={({ field: { value, onChange, ...rest } }) => (
              <Switch
                {...rest}
                label="Tüm Ürünlerde Geçerli Mi?"
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
            <Button
              type="submit"
              loading={isSubmitting}
              size="md"
              className="bg-gradient-to-r from-blue-600 to-blue-700 transition-all duration-200 hover:from-blue-700 hover:to-blue-800"
            >
              {isSubmitting ? "Güncelleniyor..." : "İndirim Kuponunu Güncelle"}
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

export default EditDiscountForm;
