"use client";
import FeedbackDialog from "@/components/FeedbackDialog";
import {
  ProductAddFormValues,
  ProductAddSchema,
  VariantData,
} from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Card,
  Divider,
  MultiSelect,
  NumberInput,
  Select,
  Textarea,
  TextInput,
} from "@mantine/core";
import { ProductType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import {
  EditProduct,
  searchGoogleCategories,
} from "../../_actions/ProductActions";
import GoogleCategorySelector from "../../_components/GoogleSelect";
import { categoryType, googleType } from "../../urun-ekle/page";
import { ProductWithVariantsType } from "../page";
import VariantForm from "../../_components/VariantForm";
const getVariantErrors = (errors) => {
  if (!errors) return null;

  // Array hatası durumu (specific variant errors)
  if (Array.isArray(errors)) {
    return errors.find((error) => error?.value?.message)?.value?.message;
  }

  // Root hatası durumu
  if ("root" in errors) {
    return errors.root?.message;
  }

  // Genel hata durumu
  return errors.message;
};
interface EditProductFormProps {
  categories: categoryType[];
  googleCategories: googleType[];
  productWithDbImages: ProductWithVariantsType;
  slug: string;
}
const EditProductForm = ({
  categories: data,
  googleCategories,
  slug,
  productWithDbImages,
}: EditProductFormProps) => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });
  const [isDraftSubmitting, setIsDraftSubmitting] = useState(false);
  const router = useRouter();
  const formattedDefaultValues = {
    name: productWithDbImages.name,
    description: productWithDbImages.description,
    shortDescription: productWithDbImages.shortDescription,
    productType: productWithDbImages.type as ProductType,
    taxPrice: productWithDbImages.taxRate,
    categories: productWithDbImages.categories.map((cat) => cat.id),
    googleCategories: productWithDbImages.googleCategoryId?.toString(),
    variants: productWithDbImages.variants.map((variant) => ({
      id: variant.id,
      active: variant.active,
      discount: variant.discount,
      isSpotLight: variant.isSpotLight,
      price: variant.price,
      richTextDescription: variant.richTextDescription,
      slug: variant.slug,
      stock: variant.stock,
      type: variant.type,
      ...(variant?.type === "WEIGHT" && {
        unit: variant.unit,
      }),
      value:
        variant?.type === "WEIGHT"
          ? parseInt(variant?.value as string)
          : variant?.value,
      imageFiles: [],
      dbImages: variant.dbImages.map((image) => image),
    })),
  };

  const {
    control,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductAddFormValues>({
    resolver: zodResolver(ProductAddSchema),
    defaultValues: {
      active: productWithDbImages.active,
      categories: formattedDefaultValues.categories,
      description: formattedDefaultValues.description,
      googleCategories: formattedDefaultValues.googleCategories,
      name: formattedDefaultValues.name,
      productType: formattedDefaultValues.productType,
      shortDescription: formattedDefaultValues.shortDescription,
      taxPrice: formattedDefaultValues.taxPrice,
      variants: formattedDefaultValues.variants.map((variant) => ({
        active: variant.active,
        discount: variant.discount,
        id: variant.id,
        imageFiles: variant.imageFiles,
        isSpotLight: variant.isSpotLight,
        price: variant.price,
        richTextDescription: variant.richTextDescription,
        slug: variant.slug,
        stock: variant.stock,
        type: variant.type,
        ...(variant?.type === "WEIGHT" && {
          unit: variant.unit || undefined,
        }),
        value:
          variant.type === "WEIGHT"
            ? parseInt(variant.value as string)
            : variant.value.toString(),
      })),
    },
  });
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "variants",
  });
  const handleDeleteVariant = (index: number) => {
    remove(index);
  };
  const handleDialogClose = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };
  const handleUpdateVariant = (updatedVariant: VariantData) => {
    const index = fields.findIndex((field) => field.id === updatedVariant.id);
    if (index !== -1) {
      update(index, {
        ...updatedVariant,
      });
    }
  };

  const handleAddVariant = (variantData: VariantData) => {
    append({
      ...variantData,
    });
  };

  const onSubmit: SubmitHandler<ProductAddFormValues> = async (
    formData,
    event,
  ) => {
    const submitEvent = event?.nativeEvent as SubmitEvent;
    const isDraft =
      (submitEvent?.submitter as HTMLButtonElement)?.getAttribute(
        "data-draft",
      ) === "true";

    try {
      if (isDraft) {
        setIsDraftSubmitting(true);
        formData.variants = formData.variants.map((variant) => ({
          ...variant,
          active: false,
        }));
      }
      const result = await EditProduct(formData, slug);
      if (!result.success) {
        setDialogState({
          isOpen: true,
          message: result.message || "Bir hata oluştu, lütfen tekrar deneyin.",
          type: "success",
        });
      }
    } catch (error) {
      setDialogState({
        isOpen: true,
        message:
          "Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
        type: "error",
      });
    } finally {
      setIsDraftSubmitting(false);
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card
          withBorder
          shadow="sm"
          bg={"black"}
          className="flex w-full flex-row items-center justify-between p-4"
        >
          <h1 className="justify-center text-white">
            {watch("name") || productWithDbImages.name}
          </h1>
          <div className="space-x-4">
            <Button
              type="submit"
              data-draft="true"
              className="justify-end"
              loading={isDraftSubmitting}
            >
              Satışa Kapalı Kaydet
            </Button>
            <Button
              type="submit"
              variant="white"
              className="justify-end"
              loading={isSubmitting && !isDraftSubmitting}
            >
              Kaydet
            </Button>
          </div>
        </Card>
        <div className="flex flex-col space-y-4 p-4">
          <Card withBorder shadow="sm" className="p-4">
            <h1 className="text-lg font-bold">Temel Bilgi</h1>
            <Divider my="xs" size="sm" />
            <div className="flex flex-col gap-1">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-2 lg:col-span-3">
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        label="Ürün Adı"
                        withAsterisk
                        error={errors.name?.message}
                        {...field}
                      />
                    )}
                  />
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <Controller
                    name="productType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        data={[
                          {
                            value: ProductType.PHYSICAL,
                            label: "Fiziksel Ürün",
                          },
                          {
                            value: ProductType.DIGITAL,
                            label: "Dijital Ürün",
                          },
                        ]}
                        withAsterisk
                        label="Ürün Türü"
                        error={errors.productType?.message}
                        {...field}
                      />
                    )}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="shortDescription"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      label="Kısa Açıklama"
                      description="Ürün kartlarında gözükecektir"
                      error={errors.shortDescription?.message}
                      {...field}
                    />
                  )}
                />
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      label="Ürün Açıklaması"
                      description="Ürün sayfasında ana yazı olarak gözükecektir"
                      error={errors.description?.message}
                      {...field}
                    />
                  )}
                />
              </div>
              <Controller
                name="taxPrice"
                control={control}
                render={({ field }) => (
                  <NumberInput
                    label="Vergi Fiyatı"
                    withAsterisk
                    error={errors.taxPrice?.message}
                    {...field}
                    max={100}
                    min={0}
                    onChange={(e) => field.onChange(Number(e))}
                  />
                )}
              />
            </div>
          </Card>{" "}
          <Card>
            <h1 className="text-lg font-bold">Ürün Detayı</h1>
            <Divider my="xs" size="sm" />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Controller
                name="categories"
                control={control}
                render={({ field }) => (
                  <MultiSelect
                    {...field}
                    label="Kategori Ekle"
                    description="Kendi sitemiz için kullanılacaktır"
                    error={errors.categories?.message}
                    multiple
                    data={data.map((item) => ({
                      value: item.id,
                      label: item.name,
                    }))}
                    onChange={(value) => field.onChange(value)}
                  />
                )}
              />

              <GoogleCategorySelector
                initialCategories={googleCategories}
                control={control}
                onSearch={searchGoogleCategories}
              />
            </div>
          </Card>
        </div>
      </form>
      <div className="p-4">
        <Card className="p-4">
          <h1 className="text-lg font-bold">
            Varyantlar{" "}
            {errors.variants && (
              <p className="text-sm text-red-500">
                {getVariantErrors(errors.variants)}
              </p>
            )}
          </h1>
          <Divider my="xs" size="sm" />

          <VariantForm
            variants={fields as VariantData[]}
            dbImages={productWithDbImages.variants.map((variant) => ({
              id: variant.id,
              urls: variant.dbImages.map((image) => image),
            }))}
            onAddVariant={handleAddVariant}
            onUpdateVariant={handleUpdateVariant}
            onDeleteVariant={(id) => {
              const index = fields.findIndex((field) => field.id === id);
              if (index !== -1) {
                handleDeleteVariant(index);
              }
            }}
          />
        </Card>
      </div>{" "}
      <FeedbackDialog
        isOpen={dialogState.isOpen}
        onClose={handleDialogClose}
        message={dialogState.message}
        type={dialogState.type}
        autoCloseDelay={2000}
      />
    </div>
  );
};

export default EditProductForm;
