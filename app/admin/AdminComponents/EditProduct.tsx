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
      categories: product.product.categories.map((category) => category.id),
      variants: [
        {
          type: product.type as VariantType,
          price: product.price,
          discount: product.discount,
          stock: product.stock,
          value: product.value,
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
        router.refresh();
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
      <div className="w-full px-5 py-4 border flex flex-col md:flex-row gap-4 border-black mt-5">
        {/* LEFT */}
        <div className="md:w-52 flex flex-col gap-5">
          {/* Diğer importlar aynı kalacak */}
          {product.Image.length > 0 ? (
            <Carousel height={208}>
              {product.Image.map((image, index) => (
                <Carousel.Slide key={index}>
                  <div className="relative w-full h-full">
                    <CloseButton
                      className="absolute top-2 right-2 z-10 hover:bg-gray-100/80"
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
            <div className="relative w-full h-52 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
              <FaImage size={40} className="text-gray-400 mb-2" />
              <Text size="sm" color="dimmed" className="text-center px-4">
                Henüz ürün resmi eklenmemiş
              </Text>
              <Text size="xs" color="dimmed" className="text-center mt-1">
                Aşağıdaki alandan resim yükleyebilirsiniz
              </Text>
            </div>
          )}
          <div className="w-full shadow-xl p-4 flex flex-col gap-2 rounded-lg">
            <h1 className="text-xl">Status</h1>
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
                  event.currentTarget.value === "true"
                )
              }
            />
          </div>
          <div className="w-full shadow-xl p-4 flex flex-col gap-2 rounded-lg">
            <h1 className="text-xl">Product Details</h1>
            <TagsInput
              label="Categories"
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
                (category) => category.name
              )}
              onChange={(value) => {
                const selectedIds = value
                  .map((selectedName) => {
                    const category = categories.find(
                      (c) => c.name === selectedName
                    );
                    return category?.id;
                  })
                  .filter(Boolean);
                setValue("categories", selectedIds);
              }}
              maxTags={categories.length}
              clearable
              placeholder="Select categories"
            />
          </div>
        </div>
        {/* CENTER */}
        <div className="flex-1 flex-col p-5">
          <div className="flex flex-col gap-4 shadow-lg rounded-lg p-5">
            <h1 className="text-lg text-gray-700 mb-2">General</h1>
            <TextInput
              label="Product Name"
              {...register("name")}
              error={errors.name?.message}
            />
            <Textarea
              label="Long Description"
              {...register("description")}
              error={errors.description?.message}
            />
            <Textarea
              label="Short Description"
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
          <div className="flex flex-col gap-4 shadow-lg rounded-lg p-5">
            <h1 className="text-lg text-gray-700 mb-2">Advanced</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-4">
              <NumberInput
                label="Price"
                {...register("variants.0.price", { valueAsNumber: true })}
                min={0}
                max={Number.MAX_SAFE_INTEGER}
                value={watch("variants.0.price")}
                onChange={(value) =>
                  setValue("variants.0.price", Number(value))
                }
                error={errors.variants?.[0]?.price?.message}
              />
              <NumberInput
                label="Discount"
                {...register("variants.0.discount", { valueAsNumber: true })}
                min={0}
                max={100}
                value={watch("variants.0.discount")}
                onChange={(value) =>
                  setValue("variants.0.discount", Number(value))
                }
                error={errors.variants?.[0]?.discount?.message}
              />
              <NumberInput
                label="Stock"
                {...register("variants.0.stock", { valueAsNumber: true })}
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
                    label="Weight Unit"
                    {...register("variants.0.unit")}
                    data={[
                      WeightUnit.Enum.G,
                      WeightUnit.Enum.KG,
                      WeightUnit.Enum.L,
                      WeightUnit.Enum.ML,
                    ]}
                    onChange={(event) =>
                      setValue(
                        "variants.0.unit",
                        event.currentTarget.value as WeightUnitType
                      )
                    }
                  />
                  <NumberInput
                    label="Weight"
                    {...register("variants.0.value", { valueAsNumber: true })}
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
                  label="Size"
                  data={[
                    Size.Enum.XS,
                    Size.Enum.S,
                    Size.Enum.M,
                    Size.Enum.XL,
                    Size.Enum.L,
                    Size.Enum.XXL,
                  ]}
                  error={errors.variants?.[0]?.value?.message}
                />
              )}

              {product.type === VariantType.COLOR && (
                <ColorInput
                  label="Color"
                  defaultValue={product.value}
                  onChange={(value) => setValue("variants.0.value", value)}
                  error={errors.variants?.[0]?.value?.message}
                />
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <Button className="mt-2" type="submit" loading={isSubmitting}>
              Submit
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
