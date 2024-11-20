"use client";
import { DeleteImgToProduct } from "@/actions/admin/products/delete-assets-on-product/delete-image/DeleteImage";
import { EditProduct as ProductEdit } from "@/actions/admin/products/edit-product/EditProduct";
import CustomImage from "@/components/CustomImage";
import FeedbackDialog from "@/components/FeedbackDialog";
import {
  EditProductSchema,
  EditProductSchemaType,
  Size,
  WeightUnit,
  WeightUnitType,
} from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Carousel } from "@mantine/carousel";
import "@mantine/carousel/styles.css";
import {
  Button,
  CloseButton,
  ColorInput,
  NativeSelect,
  NumberInput,
  Switch,
  TagsInput,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { VariantType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { FaImage } from "react-icons/fa";
import ImageDropzone from "./ImageDropzone";

const EditProduct = ({ product, categories }) => {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditProductSchemaType>({
    resolver: zodResolver(EditProductSchema),
    defaultValues: {
      name: product.product.name,
      description: product.product.description,
      shortDescription: product.product.shortDescription,
      taxPrice: product.product.taxRate,
      categories: product.product.categories.map((category) => category.id),
      variants: [
        {
          type: product.type as VariantType,
          price: product.price,
          discount: product.discount,
          stock: product.stock,
          value: product.value,
          isSpotlightPublished: product.isSpotlightFeatured,
          active: product.isPublished,
          unit: product.unit,
          imageFile: [],
        },
      ],
    },
  });
  const router = useRouter();
  const onSubmit: SubmitHandler<EditProductSchemaType> = async (data) => {
    await ProductEdit(data, product.id, product.product.id).then((res) => {
      if (res.success) {
        setDialogState({
          isOpen: true,
          message: res.message,
          type: "success",
        });
        reset();
        router.push("/admin/urunler");
      } else {
        setDialogState({
          isOpen: true,
          message: res.message,
          type: "error",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mt-5 flex w-full flex-col gap-4 border px-5 py-4 shadow-xl md:flex-row">
        {/* LEFT */}
        <div className="flex flex-col gap-5 md:w-52">
          {/* Diğer importlar aynı kalacak */}
          {product.Image.length > 0 ? (
            <Carousel height={208}>
              {product.Image.map((image, index) => (
                <Carousel.Slide key={index}>
                  <div className="relative h-full w-full">
                    <CloseButton
                      className="absolute right-2 top-2 z-10 hover:bg-gray-100/80"
                      onClick={async () => {
                        await DeleteImgToProduct(image.url).then((res) => {
                          if (res.success) router.refresh();
                        });
                      }}
                    />
                    <CustomImage
                      src={image.url.replace(/\.[^/.]+$/, "")}
                      quality={20}
                    />
                  </div>
                </Carousel.Slide>
              ))}
            </Carousel>
          ) : (
            <div className="relative flex h-52 w-full flex-col items-center justify-center rounded-lg bg-gray-100">
              <FaImage size={40} className="mb-2 text-gray-400" />
              <Text size="sm" color="dimmed" className="px-4 text-center">
                Henüz ürün resmi eklenmemiş
              </Text>
              <Text size="xs" color="dimmed" className="mt-1 text-center">
                Aşağıdaki alandan resim yükleyebilirsiniz
              </Text>
            </div>
          )}
          <div className="flex w-full flex-col gap-2 rounded-lg p-4">
            <h1 className="text-xl">Durum</h1>
            <NativeSelect
              {...register("variants.0.active", {
                setValueAs: (v) => v === "true",
              })}
              data={[
                { label: "Yayında", value: "true" },
                { label: "Yayında Değil", value: "false" },
              ]}
              defaultValue={String(product.isPublished)}
              onChange={(event) =>
                setValue(
                  "variants.0.active",
                  event.currentTarget.value === "true",
                )
              }
            />
          </div>
          <div className="flex w-full flex-col gap-2 rounded-lg p-4">
            <h1 className="text-xl">Ürün Detayları</h1>
            <TagsInput
              label="Kategoriler"
              data={categories.map((category) => ({
                value: category.id,
                label: category.name,
              }))}
              error={errors.categories?.message}
              value={
                watch("categories")?.map((categoryId) => {
                  const category = categories.find((c) => c.id === categoryId);
                  return category?.name || categoryId;
                }) || []
              }
              defaultValue={product.product.categories.map(
                (category) => category.name,
              )}
              onChange={(value) => {
                const selectedIds = value
                  .map((selectedName) => {
                    const category = categories.find(
                      (c) => c.name === selectedName,
                    );
                    return category?.id;
                  })
                  .filter(Boolean);
                setValue("categories", selectedIds);
              }}
              maxTags={categories.length}
              clearable
              placeholder="Kategori seçin"
            />
          </div>
        </div>
        {/* ORTA PANEL */}
        <div className="flex-1 flex-col p-5">
          <div className="flex flex-col gap-4 rounded-lg p-5">
            <h1 className="mb-2 text-lg text-gray-700">Genel Bilgiler</h1>
            <Switch
              {...register("variants.0.isSpotlightPublished")}
              onLabel="Aktif"
              size="lg"
              offLabel="Pasif"
              description="Arama Çubuğunda göstermek için açabilirsiniz. Maksimum 10 ürün gösterilir."
            />
            <TextInput
              label="Ürün Adı"
              {...register("name")}
              error={errors.name?.message}
            />
            <Textarea
              label="Detaylı Açıklama"
              {...register("description")}
              error={errors.description?.message}
            />
            <Textarea
              label="Kısa Açıklama"
              {...register("shortDescription")}
              error={errors.shortDescription?.message}
            />
            <ImageDropzone
              name="variants.0.imageFile"
              setValue={setValue}
              trigger={trigger}
              value={watch("variants.0.imageFile")}
              error={errors.variants?.[0]?.imageFile?.message}
              maxFiles={5}
              required
            />
          </div>
          <div className="flex flex-col gap-4 rounded-lg p-5">
            <h1 className="mb-2 text-lg text-gray-700">Gelişmiş Ayarlar</h1>
            <div className="grid grid-cols-3 lg:grid-cols-2 lg:gap-4">
              <NumberInput
                label="Fiyat"
                {...register("variants.0.price", {
                  setValueAs: (v) => Number(v),
                })}
                min={0}
                max={Number.MAX_SAFE_INTEGER}
                value={watch("variants.0.price")}
                onChange={(value) =>
                  setValue("variants.0.price", Number(value))
                }
                error={errors.variants?.[0]?.price?.message}
              />{" "}
              <NumberInput
                {...register("taxPrice", {
                  setValueAs: (v) => Number(v),
                })}
                onChange={(e) => setValue("taxPrice", Number(e))}
                min={0}
                max={100}
                defaultValue={product.product.taxRate}
                label="Kdv oranı"
                error={errors.taxPrice?.message}
              />
              <NumberInput
                label="İndirim (%)"
                {...register("variants.0.discount", {
                  setValueAs: (v) => Number(v),
                })}
                min={0}
                max={100}
                value={watch("variants.0.discount")}
                onChange={(value) =>
                  setValue("variants.0.discount", Number(value))
                }
                error={errors.variants?.[0]?.discount?.message}
              />
              <NumberInput
                label="Stok"
                {...register("variants.0.stock", {
                  setValueAs: (v) => Number(v),
                })}
                min={0}
                max={Number.MAX_SAFE_INTEGER}
                value={watch("variants.0.stock")}
                onChange={(value) =>
                  setValue("variants.0.stock", Number(value))
                }
                error={errors.variants?.[0]?.stock?.message}
              />
              {product.type === VariantType.WEIGHT && (
                <>
                  <NativeSelect
                    label="Ağırlık Birimi"
                    {...register("variants.0.unit")}
                    data={[
                      { value: WeightUnit.Enum.G, label: "Gram" },
                      { value: WeightUnit.Enum.KG, label: "Kilogram" },
                      { value: WeightUnit.Enum.L, label: "Litre" },
                      { value: WeightUnit.Enum.ML, label: "Mililitre" },
                    ]}
                    onChange={(event) =>
                      setValue(
                        "variants.0.unit",
                        event.currentTarget.value as WeightUnitType,
                      )
                    }
                  />
                  <NumberInput
                    label="Ağırlık/Hacim"
                    {...register("variants.0.value", {
                      setValueAs: (v) => Number(v),
                    })}
                    min={0}
                    max={Number.MAX_SAFE_INTEGER}
                    value={watch("variants.0.value")}
                    onChange={(value) =>
                      setValue("variants.0.value", Number(value))
                    }
                    error={errors.variants?.[0]?.value?.message}
                  />
                </>
              )}
              {product.type === VariantType.SIZE && (
                <NativeSelect
                  {...register("variants.0.value")}
                  label="Beden"
                  data={[
                    { value: Size.Enum.XS, label: "Çok Küçük (XS)" },
                    { value: Size.Enum.S, label: "Küçük (S)" },
                    { value: Size.Enum.M, label: "Orta (M)" },
                    { value: Size.Enum.L, label: "Büyük (L)" },
                    { value: Size.Enum.XL, label: "Çok Büyük (XL)" },
                    { value: Size.Enum.XXL, label: "2XL" },
                  ]}
                  error={errors.variants?.[0]?.value?.message}
                />
              )}
              {product.type === VariantType.COLOR && (
                <ColorInput
                  label="Renk"
                  defaultValue={product.value}
                  onChange={(value) => setValue("variants.0.value", value)}
                  error={errors.variants?.[0]?.value?.message}
                />
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <Button className="mt-2" type="submit" loading={isSubmitting}>
              Kaydet
            </Button>
          </div>
        </div>
      </div>
      <FeedbackDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
        message={dialogState.message}
        type={dialogState.type}
      />
    </form>
  );
};

export default EditProduct;
