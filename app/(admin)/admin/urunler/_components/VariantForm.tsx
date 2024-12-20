"use client";
import { variantSlugify } from "@/utils/SlugifyVariants";
import { Variants, type VariantData } from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Card,
  ColorInput,
  Drawer,
  Group,
  NumberInput,
  Select,
  Switch,
  Text,
  TextInput,
} from "@mantine/core";
import { VariantType } from "@prisma/client";
import React, { useCallback, useEffect } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { VariantDataWithDbImages } from "../[slug]/page";
import CustomDropzone from "./CustomDropzone";
import ExistingImagesDisplay from "./ExistingImagesDisplay";
import TipTapEditor from "./RichTextEditor";
import SEOCard from "./SeoCard";

interface AddVariantProps {
  opened: boolean;
  onClose: () => void;
  editingVariant?: VariantData | null;
  onSubmit?: (data: VariantData) => void;
  productSlug?: string;
  existingImages?: string[];
}

enum WeightUnit {
  ML = "ML",
  L = "L",
  G = "G",
  KG = "KG",
}

const SUPPORTED_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const SUPPORTED_UNITS = Object.values(WeightUnit);

const VariantForm: React.FC<AddVariantProps> = ({
  opened,
  onClose,
  editingVariant,
  onSubmit: onSubmitProp,
  productSlug,
  existingImages,
}) => {
  const getDefaultValues = useCallback((variant?: VariantDataWithDbImages) => {
    const unitValue =
      variant?.type === VariantType.WEIGHT
        ? (variant?.unit as WeightUnit) || WeightUnit.KG
        : undefined;

    return {
      uniqueId: variant?.uniqueId || crypto.randomUUID(),
      type: variant?.type || undefined,
      value:
        variant?.type === VariantType.WEIGHT
          ? parseInt(variant?.value as string)
          : variant?.value || "",
      price: variant?.price || 0,
      discount: variant?.discount || 0,
      active: variant?.active ?? true,
      stock: variant?.stock || 0,
      slug: variant?.slug || "",
      unit: unitValue,
      pageTitle: variant?.pageTitle || "",
      metaDescription: variant?.metaDescription || "",
      imageFiles: [],
      isSpotLight: variant?.isSpotLight || false,
      richTextDescription: variant?.richTextDescription || null,
    };
  }, []);
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
    reset,
  } = useForm<VariantData>({
    resolver: zodResolver(Variants),
    defaultValues: getDefaultValues(editingVariant || undefined),
    mode: "onChange",
  });

  const variantType = watch("type");
  const variantValue = watch("value");
  const variantUnit = watch("unit") as WeightUnit | undefined;

  useEffect(() => {
    if (productSlug && variantType && variantValue) {
      const slugValue =
        variantType === VariantType.WEIGHT
          ? variantValue.toString() // number'ı string'e çevir
          : (variantValue as string); // zaten string

      const variantSlug = variantSlugify({
        type: variantType,
        productName: productSlug,
        value: slugValue,
        language: "tr",
        unit: variantUnit,
      });

      setValue("slug", `${productSlug}/${variantSlug}`, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [productSlug, variantType, variantValue, variantUnit, setValue]);

  const onFormSubmit: SubmitHandler<VariantData> = (data) => {
    const submissionData = {
      ...data,
      uniqueId: editingVariant?.uniqueId ?? data.uniqueId, // Düzenleme modunda orijinal uniqueId'yi koru
      value: data.type === VariantType.WEIGHT ? String(data.value) : data.value,
    };
    onSubmitProp?.(submissionData);
    onClose();
  };

  const resetForm = useCallback(
    (variant?: VariantDataWithDbImages) => {
      if (variant) {
        reset(getDefaultValues(variant));
      } else {
        reset({
          ...getDefaultValues(),
          uniqueId: crypto.randomUUID(),
        });
      }
    },
    [getDefaultValues, reset],
  );
  useEffect(() => {
    if (!opened) {
      resetForm();
    }
  }, [opened, resetForm]);
  useEffect(() => {
    if (editingVariant && opened) {
      resetForm(editingVariant);
    }
  }, [editingVariant, opened, resetForm]);
  const renderVariantInput = () => {
    switch (variantType) {
      case VariantType.COLOR:
        return (
          <Controller
            name="value"
            control={control}
            render={({ field }) => (
              <ColorInput
                {...field}
                label="Renk Seçin"
                placeholder="Hex renk kodu"
                withAsterisk
                error={errors.value?.message}
                value={field.value as string}
                onChange={(value) => {
                  field.onChange(value);
                  setValue("value", value, { shouldValidate: true });
                }}
              />
            )}
          />
        );

      case VariantType.SIZE:
        return (
          <Controller
            name="value"
            control={control}
            render={({ field }) => (
              <Select
                label="Beden Seçin"
                placeholder="Beden seçin"
                data={SUPPORTED_SIZES}
                withAsterisk
                error={errors.value?.message}
                {...field}
                value={field.value as string}
                onChange={(value) => {
                  field.onChange(value);
                  setValue("value", value, { shouldValidate: true });
                }}
              />
            )}
          />
        );

      case VariantType.WEIGHT:
        return (
          <Group grow>
            <Controller
              name="value"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Ağırlık"
                  placeholder="Ağırlık girin"
                  withAsterisk
                  min={0}
                  max={Number.MAX_SAFE_INTEGER}
                  error={errors.value?.message}
                  {...field}
                  onChange={(value) => {
                    setValue("value", Number(value), { shouldValidate: true });
                  }}
                />
              )}
            />
            <Controller
              name="unit"
              control={control}
              render={({ field }) => (
                <Select
                  label="Birim"
                  placeholder="Birim seçin"
                  data={SUPPORTED_UNITS}
                  withAsterisk
                  error={errors.unit?.message}
                  {...field}
                  onChange={(value) => {
                    field.onChange(value as WeightUnit);
                    setValue("unit", value as WeightUnit, {
                      shouldValidate: true,
                    });
                  }}
                />
              )}
            />
          </Group>
        );

      default:
        return null;
    }
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      withCloseButton
      size="100%"
      title={editingVariant ? "Varyant Düzenle" : "Varyant Ekle"}
    >
      <form
        onSubmit={handleSubmit(onFormSubmit)}
        className="flex flex-col space-y-4"
      >
        <Card className="flex flex-col space-y-4">
          <Text className="text-lg font-bold">Varyant Seçimi</Text>
          <Controller
            name="uniqueId"
            control={control}
            render={({ field }) => <TextInput type="hidden" {...field} />}
          />
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select
                label="Varyant Tipi"
                placeholder="Varyant tipi seçin"
                {...field}
                data={[
                  { value: VariantType.COLOR, label: "Renk" },
                  { value: VariantType.SIZE, label: "Beden" },
                  { value: VariantType.WEIGHT, label: "Ağırlık" },
                ]}
                error={errors.type?.message}
                disabled={!!editingVariant} // Düzenleme modunda tip değiştirilemez
                onChange={(value) => {
                  field.onChange(value);
                  // Tip değiştiğinde value ve unit'i sıfırla
                  setValue("value", "");
                  setValue("unit", undefined);
                }}
              />
            )}
          />
          {renderVariantInput()}
        </Card>

        <Card className="flex flex-col space-y-4">
          <Text className="text-lg font-bold">Genel Ayarlar</Text>
          <div className="flex flex-row gap-4">
            <Controller
              name="active"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Switch
                  label="Aktif"
                  checked={value}
                  onChange={(event) => onChange(event.currentTarget.checked)}
                />
              )}
            />
            <Controller
              name="isSpotLight"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Switch
                  label="Spotlight"
                  description="Bu değer arama spotlight'ında ürününüzün göstermesini sağlar"
                  checked={value}
                  onChange={(event) => onChange(event.currentTarget.checked)}
                />
              )}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Fiyat"
                  withAsterisk
                  min={0}
                  suffix=" TL"
                  error={errors.price?.message}
                  {...field}
                />
              )}
            />
            <Controller
              name="discount"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="İndirim Oranı"
                  withAsterisk
                  suffix="%"
                  min={0}
                  max={100}
                  error={errors.discount?.message}
                  {...field}
                />
              )}
            />
            <Controller
              name="stock"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Stok"
                  error={errors.stock?.message}
                  {...field}
                />
              )}
            />
          </div>
        </Card>

        <Card className="flex flex-col space-y-4">
          <Text className="text-lg font-bold">Ürün Görselleri</Text>
          {existingImages && <ExistingImagesDisplay images={existingImages} />}
          <CustomDropzone name="imageFiles" control={control} maxFiles={5} />
        </Card>

        <Card className="flex flex-col space-y-4">
          <Text className="text-lg font-bold">Ürün Özellikleri</Text>
          <Text size="xs">
            Bu alana özellik olarak sadece ürün sayfasında gösterilecektir.
          </Text>
          <Controller
            name="richTextDescription"
            control={control}
            render={({ field: { value, onChange } }) => (
              <TipTapEditor
                value={value}
                onChange={onChange}
                className={errors.richTextDescription ? "border-red-500" : ""}
              />
            )}
          />
          {errors.richTextDescription && (
            <Text color="red" size="sm">
              {errors.richTextDescription.message}
            </Text>
          )}
        </Card>

        <SEOCard control={control} errors={errors} />

        <Group justify="flex-end" mt="xl">
          <Button type="button" variant="light" onClick={onClose}>
            İptal
          </Button>
          <Button
            type="submit"
            color="blue"
            disabled={!isDirty} // Form değişmediyse buton disabled
          >
            {editingVariant ? "Güncelle" : "Kaydet"}
          </Button>
        </Group>
      </form>
    </Drawer>
  );
};

export default VariantForm;
