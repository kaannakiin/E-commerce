"use client";
import FeedbackDialog from "@/components/FeedbackDialog";
import MainLoader from "@/components/MainLoader";
import {
  ProductAddFormValues,
  ProductAddSchema,
  VariantData,
} from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
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
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { ProductWithVariantsType } from "../[slug]/page";
import {
  AddProduct,
  EditProduct,
  searchGoogleCategories,
} from "../_actions/ProductActions";
import { categoryType, googleType } from "../urun-ekle/page";
import CategoryAddModal from "./CategoryAddModal";
import GoogleCategorySelector from "./GoogleSelect";
import VariantForm from "./VariantForm";
import { VariantList } from "./VariantsList";

const ProductForm = ({
  data,
  googleCategory,
  defaultValues,
}: {
  data: categoryType[];
  googleCategory: googleType[];
  defaultValues?: ProductWithVariantsType;
}) => {
  const router = useRouter();
  const params = useParams();

  const [dialogState, setDialogState] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ProductAddFormValues>({
    resolver: zodResolver(ProductAddSchema),
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          shortDescription: defaultValues.shortDescription,
          description: defaultValues.description,
          productType: defaultValues.type,
          categories: defaultValues.categories.map((cat) => cat.id),
          taxPrice: defaultValues.taxRate,
          active: defaultValues.active,
          googleCategories: defaultValues.googleCategoryId.toString(),
          variants: defaultValues.variants.map((variant) => ({
            uniqueId: variant.uniqueId, // id yerine uniqueId kullan
            price: variant.price,
            stock: variant.stock,
            discount: variant.discount,
            richTextDescription: variant.richTextDescription,
            imageFiles: [],
            isSpotLight: variant.isSpotLight,
            slug: variant.slug,
            metaDescription: variant.metaDescription,
            pageTitle: variant.pageTitle,
            type: variant.type,
            active: variant.active,
            unit: variant.type === "WEIGHT" ? variant.unit : null,
            value:
              variant.type === "WEIGHT"
                ? parseInt(variant.value.toString())
                : (variant.value as string),
          })),
        }
      : {
          name: "",
          shortDescription: "",
          description: "",
          productType: ProductType.PHYSICAL,
          categories: [],
          variants: [],
          taxPrice: 20,
          active: true,
          googleCategories: "",
        },
  });
  const [isVariantFormOpen, setIsVariantFormOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<VariantData | null>(
    null,
  );

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "variants",
  });
  const handleAddVariant = (variantData: VariantData) => {
    append({
      ...variantData,
      uniqueId: variantData.uniqueId || crypto.randomUUID(),
    });
    setIsVariantFormOpen(false);
  };
  const handleEditVariant = (variant: VariantData) => {
    setEditingVariant(variant);
    setIsVariantFormOpen(true);
  };
  const handleUpdateVariant = (updatedVariant: VariantData) => {
    const index = fields.findIndex(
      (field) => field.uniqueId === updatedVariant.uniqueId,
    );
    if (index !== -1) {
      update(index, {
        ...updatedVariant,
        imageFiles: updatedVariant.imageFiles || [], // defaultValues kontrolünü kaldır
      });
    }
    setIsVariantFormOpen(false);
    setEditingVariant(null);
  };

  const handleDeleteVariant = (uniqueId: string) => {
    const index = fields.findIndex((field) => field.uniqueId === uniqueId);
    if (index !== -1) {
      remove(index);
    }
  };
  const onSubmit = async (formData: ProductAddFormValues) => {
    try {
      const res = { success: false, message: "" };
      if (params.slug as string) {
        await EditProduct(formData, params.slug as string).then((response) => {
          res.success = response.success;
          res.message = response.message;
        });
      } else {
        await AddProduct(formData).then((response) => {
          res.success = response.success;
          res.message = response.message;
        });
      }

      if (res.success) {
        setDialogState({
          isOpen: true,
          message: res.message,
          type: "success",
        });
        router.push("/admin/urunler");
      } else {
        setDialogState({
          isOpen: true,
          message: res.message,
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
      console.error("Form submission error:", error);
    }
  };
  const handleVariantFormClose = () => {
    setIsVariantFormOpen(false);
    setEditingVariant(null);
  };
  const handleDialogClose = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };
  const handleFormSubmit = (isActive: boolean) => {
    return handleSubmit((data) => {
      return onSubmit({
        ...data,
        active: isActive,
      });
    });
  };
  if (isSubmitting) {
    return <MainLoader />;
  }
  return (
    <div>
      {data.length > 0 ? (
        <div>
          <Box component="form">
            <Card
              withBorder
              shadow="sm"
              bg={"black"}
              className="flex w-full flex-row items-center justify-between p-4"
            >
              <h1 className="justify-center text-white">
                {watch("name") || "Yeni Ürün"}
              </h1>
              <div className="flex flex-row items-center justify-end gap-3">
                <Button
                  type="submit"
                  variant="white"
                  onClick={handleFormSubmit(false)}
                >
                  Satışa Kapalı Olarak Kaydet
                </Button>
                <Button
                  type="submit"
                  variant="white"
                  onClick={handleFormSubmit(true)}
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
              </Card>
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
                        withAsterisk
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
                    initialCategories={googleCategory}
                    control={control}
                    onSearch={searchGoogleCategories}
                  />
                </div>
                <CategoryAddModal extraCategory />
              </Card>{" "}
              <Card withBorder shadow="sm" className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h1 className="text-lg font-bold">Varyantlar</h1>
                  <Button
                    variant="light"
                    onClick={() => {
                      setEditingVariant(null);
                      setIsVariantFormOpen(true);
                    }}
                  >
                    Yeni Varyant Ekle
                  </Button>
                </div>
                <Divider my="xs" size="sm" />
                {errors.variants && (
                  <p className="mb-2 text-xs text-red-500">
                    {errors.variants.message}
                  </p>
                )}
                <VariantList
                  variants={fields as VariantData[]}
                  onDeleteVariant={handleDeleteVariant}
                  onEditVariant={handleEditVariant}
                />
              </Card>
            </div>
          </Box>
          <VariantForm
            opened={isVariantFormOpen}
            onClose={handleVariantFormClose}
            editingVariant={editingVariant}
            existingImages={
              defaultValues &&
              defaultValues.variants.find(
                (variant) => variant.uniqueId === editingVariant?.uniqueId,
              )?.dbImages
            }
            onSubmit={editingVariant ? handleUpdateVariant : handleAddVariant}
          />
        </div>
      ) : (
        <CategoryAddModal />
      )}
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

export default ProductForm;
