"use client";
import { AddProduct } from "@/actions/admin/products/add-product/AddProduct";
import { formattedPrice } from "@/lib/format";
import {
  AddColorVariant,
  AddColorVariantType,
  AddProductSchema,
  AddProductSchemaType,
  AddSizeVariant,
  AddSizeVariantType,
  AddWeightVariant,
  AddWeightVariantType,
  SizeType,
  WeightUnitType,
} from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Carousel } from "@mantine/carousel";
import "@mantine/carousel/styles.css";
import {
  ActionIcon,
  Button,
  ColorPicker,
  ColorSwatch,
  Modal,
  MultiSelect,
  NativeSelect,
  NumberInput,
  rem,
  ScrollArea,
  Select,
  Table,
  TextInput,
} from "@mantine/core";
import { VariantType } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { FaRegTrashCan } from "react-icons/fa6";
import ImageDropzone from "./ImageDropzone";
import FeedbackDialog from "@/components/FeedbackDialog";

const AddProductForm = ({ feedCat }) => {
  const [variant, setVariant] = useState<string>();
  const [openModals, setOpenModals] = useState<{ [key: number]: boolean }>({});
  const [variantModal, setVariantModal] = useState<boolean>(false);
  const [feedbackState, setFeedbackState] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });
  const router = useRouter();
  const {
    register: productRegister,
    handleSubmit: productHandleSubmit,
    setValue: productSetValue,
    getValues: productGetValues,
    watch: productWatch,
    formState: {
      errors: productErrors,
      isSubmitting: productIsSubmitting,
      isValid: productIsValid,
    },
  } = useForm<AddProductSchemaType>({
    resolver: zodResolver(AddProductSchema),
    defaultValues: {
      variants: [],
    },
  });
  const variants = productWatch("variants");
  const {
    register: weightRegister,
    handleSubmit: weightHandleSubmit,
    setValue: weightSetValue,
    trigger: weightTrigger,
    watch: weightWatch,
    formState: {
      errors: weightError,
      isSubmitting: weightIsSubmitting,
      isValid: weightIsValid,
    },
  } = useForm<AddWeightVariantType>({
    resolver: zodResolver(AddWeightVariant),
    defaultValues: {
      type: VariantType.WEIGHT,
    },
  });
  const {
    register: colorRegister,
    handleSubmit: colorHandleSubmit,
    setValue: setColorValue,
    trigger: colorTrigger,
    watch: colorWatch,
    formState: {
      errors: colorErrors,
      isSubmitting: colorIsSubmitting,
      isValid: colorIsValid,
    },
  } = useForm<AddColorVariantType>({
    resolver: zodResolver(AddColorVariant),
    defaultValues: {
      type: VariantType.COLOR,
    },
  });
  const {
    register: sizeRegister,
    handleSubmit: sizeHandleSubmit,
    setValue: sizeSetValue,
    trigger: sizeTrigger,
    watch: sizeWatch,
    formState: {
      errors: sizeErrors,
      isSubmitting: sizeIsSubmitting,
      isValid: sizeIsValid,
    },
  } = useForm<AddSizeVariantType>({
    resolver: zodResolver(AddSizeVariant),
    defaultValues: {
      type: VariantType.SIZE,
    },
  });
  const onWeightSubmit: SubmitHandler<AddWeightVariantType> = (data) => {
    productSetValue("variants", [...productGetValues("variants"), data]);
    setVariantModal(false);
    setVariant(undefined);
    setFeedbackState({
      isOpen: true,
      message: "Varyant başarıyla eklendi",
      type: "success",
    });
  };

  const onColorSubmit: SubmitHandler<AddColorVariantType> = (data) => {
    productSetValue("variants", [...productGetValues("variants"), data]);
    setVariantModal(false);
    setVariant(undefined);
    setFeedbackState({
      isOpen: true,
      message: "Varyant başarıyla eklendi",
      type: "success",
    });
  };

  const onSizeSubmit: SubmitHandler<AddSizeVariantType> = (data) => {
    productSetValue("variants", [...productGetValues("variants"), data]);
    setVariantModal(false);
    setVariant(undefined);
    setFeedbackState({
      isOpen: true,
      message: "Varyant başarıyla eklendi",
      type: "success",
    });
  };

  const onProductSubmit: SubmitHandler<AddProductSchemaType> = async (data) => {
    try {
      const result = await AddProduct(data);
      if (result.success) {
        setFeedbackState({
          isOpen: true,
          message: "Ürün başarıyla eklendi",
          type: "success",
        });
        setTimeout(() => {
          router.push("/admin/urunler");
        }, 2000);
      } else {
        setFeedbackState({
          isOpen: true,
          message: "Bir hata oluştu",
          type: "error",
        });
      }
    } catch (error) {
      setFeedbackState({
        isOpen: true,
        message: "Ürün eklenirken bir hata oluştu",
        type: "error",
      });
    }
  };

  return (
    <div className="flex flex-col py-5 px-10 gap-10">
      <div className="w-full flex flex-col lg:flex-row gap-5  ">
        <div className="flex flex-col lg:w-1/4 ">
          <h1 className="text-2xl uppercase font-bold">Genel Bilgiler</h1>
          <form onSubmit={productHandleSubmit(onProductSubmit)}>
            <MultiSelect
              {...productRegister("categories")}
              data={feedCat.map((cat) => ({ label: cat.name, value: cat.id }))}
              onChange={(e) =>
                productSetValue(
                  "categories",
                  feedCat
                    .filter((cat) => e.includes(cat.id))
                    .map((cat) => cat.id)
                )
              }
              error={productErrors.categories?.message}
              searchable
              clearable
              size="sm"
              label="Kategori"
              description="Ürünün hangi kategoriye ait olduğunu seçin."
              variant="filled"
            />
            <TextInput
              {...productRegister("name")}
              error={productErrors.name?.message}
              label="Ürün Adı"
              size="sm"
              variant="filled"
            />
            <TextInput
              {...productRegister("description")}
              error={productErrors.description?.message}
              label="Ürün Açıklaması"
              size="sm"
              variant="filled"
            />
            <TextInput
              {...productRegister("shortDescription")}
              error={productErrors.shortDescription?.message}
              label="Ürün Kısa Açıklaması"
              description="Bu açıklama ürün kartlarında gözükecektir. Ürün sayfasında ürünün kendi açıklaması gözükecektir."
              size="sm"
              variant="filled"
            />
            <p className="text-xs mt-5 text-gray-600">
              Bütün kontrolleri yaptığınızda ekleyiniz.
            </p>
            <Button
              type="submit"
              fullWidth
              loading={productIsSubmitting}
              disabled={!productIsValid}
            >
              Ürün ekle
            </Button>
          </form>
        </div>
        <div className=" flex flex-col gap-5 lg:w-1/4  ">
          <h1 className="text-2xl font-bold">Varyantlar</h1>
          <Select
            label="Varyant Seçiniz"
            variant="filled"
            comboboxProps={{
              transitionProps: { transition: "pop", duration: 100 },
            }}
            data={["Renk", "Beden", "Ağırlık"]}
            value={variant}
            onChange={(e) => {
              if (e === null) return;
              setVariant(e);
              setVariantModal(true);
            }}
          />
          <Modal
            centered
            opened={variantModal}
            onClose={() => setVariantModal(false)}
            title={`Varyant Ekle - ${variant}`}
          >
            {variant === "Renk" && (
              <form
                onSubmit={colorHandleSubmit(onColorSubmit)}
                className="space-y-4"
              >
                <ColorPicker
                  format="hex"
                  {...colorRegister("value")}
                  onChange={(e) => setColorValue("value", e)}
                  variant="filled"
                  size="sm"
                  fullWidth
                  swatches={[
                    "#2e2e2e",
                    "#868e96",
                    "#fa5252",
                    "#e64980",
                    "#be4bdb",
                    "#7950f2",
                    "#4c6ef5",
                    "#228be6",
                    "#15aabf",
                    "#12b886",
                    "#40c057",
                    "#82c91e",
                    "#fab005",
                    "#fd7e14",
                  ]}
                />
                <NumberInput
                  {...colorRegister("price", { setValueAs: (v) => Number(v) })}
                  onChange={(e) => setColorValue("price", Number(e))}
                  error={colorErrors.price?.message}
                  label="Ürün Fiyatı"
                  size="sm"
                  variant="filled"
                  defaultValue={0}
                  min={0}
                  max={Number.MAX_SAFE_INTEGER}
                />
                <NumberInput
                  {...colorRegister("discount", {
                    setValueAs: (v) => Number(v),
                  })}
                  onChange={(e) => setColorValue("discount", Number(e))}
                  error={colorErrors.discount?.message}
                  label="Ürün indirimi"
                  size="sm"
                  variant="filled"
                  min={0}
                  max={100}
                />
                <NativeSelect
                  data={[
                    { label: "Yayında", value: "true" },
                    { label: "Yayında Değil", value: "false" },
                  ]}
                  {...colorRegister("active", {
                    setValueAs: (v) => v === "true",
                  })}
                  onChange={(e) =>
                    setColorValue("active", e.currentTarget.value === "true")
                  }
                  error={colorErrors.active?.message}
                  defaultValue={"false"}
                  label="Durum"
                  description="Ürün eklendiğinde gözükmesin isterseniz Yayında değili seçin"
                  variant="filled"
                  size="sm"
                />
                <ImageDropzone
                  name="imageFile"
                  setValue={setColorValue}
                  trigger={colorTrigger} // form hook'undan trigger'ı da almamız gerekiyor
                  value={colorWatch("imageFile")} // form hook'undan watch'u da almamız gerekiyor
                  error={colorErrors.imageFile?.message}
                  maxFiles={5}
                  required
                />
                <NumberInput
                  {...colorRegister("stock", { setValueAs: (v) => Number(v) })}
                  onChange={(e) => setColorValue("stock", Number(e))}
                  error={colorErrors.stock?.message}
                  label="Ürün Stok"
                  size="sm"
                  variant="filled"
                  min={0}
                  max={Number.MAX_SAFE_INTEGER}
                  description="Ürün stok takibi yapmak için gereklidir"
                />
                <Button
                  type="submit"
                  fullWidth
                  mt={20}
                  disabled={!colorIsValid}
                  loading={colorIsSubmitting}
                >
                  Varyant Ekle
                </Button>
              </form>
            )}
            {variant === "Beden" && (
              <form
                onSubmit={sizeHandleSubmit(onSizeSubmit)}
                className="space-y-4"
              >
                <Select
                  data={["XS", "S", "M", "L", "XL", "XXL"]}
                  {...sizeRegister("value")}
                  onChange={(e) => sizeSetValue("value", e as SizeType)}
                  variant="filled"
                  label="Beden seçiniz"
                />
                <NumberInput
                  {...(sizeRegister("price"), { setValueAs: (v) => Number(v) })}
                  onChange={(e) => sizeSetValue("price", Number(e))}
                  error={sizeErrors.price?.message}
                  label="Ürün fiyatı"
                  min={0}
                  max={Number.MAX_SAFE_INTEGER}
                  variant="filled"
                />
                <NumberInput
                  {...sizeRegister("discount", {
                    setValueAs: (v) => Number(v),
                  })}
                  onChange={(e) => sizeSetValue("discount", Number(e))}
                  error={sizeErrors.discount?.message}
                  label="Ürün indirimi"
                  size="sm"
                  variant="filled"
                  min={0}
                  max={100}
                />
                <NativeSelect
                  data={[
                    { label: "Yayında", value: "true" },
                    { label: "Yayında Değil", value: "false" },
                  ]}
                  {...sizeRegister("active", {
                    setValueAs: (v) => v === "true",
                  })}
                  onChange={(e) =>
                    sizeSetValue("active", e.currentTarget.value === "true")
                  }
                  error={sizeErrors.active?.message}
                  defaultValue={"false"}
                  label="Durum"
                  description="Ürün eklendiğinde gözükmesin isterseniz Yayında değili seçin"
                  variant="filled"
                  size="sm"
                />
                <ImageDropzone
                  name="imageFile"
                  setValue={sizeSetValue}
                  trigger={sizeTrigger} // form hook'undan trigger'ı da almamız gerekiyor
                  value={sizeWatch("imageFile")} // form hook'undan watch'u da almamız gerekiyor
                  error={sizeErrors.imageFile?.message}
                  maxFiles={5}
                  required
                />
                <NumberInput
                  {...sizeRegister("stock", { setValueAs: (v) => Number(v) })}
                  onChange={(e) => sizeSetValue("stock", Number(e))}
                  error={sizeErrors.stock?.message}
                  label="Ürün Stok"
                  size="sm"
                  variant="filled"
                  min={0}
                  max={Number.MAX_SAFE_INTEGER}
                  description="Ürün stok takibi yapmak için gereklidir"
                />
                <Button
                  type="submit"
                  fullWidth
                  mt={20}
                  loading={sizeIsSubmitting}
                  disabled={!sizeIsValid}
                >
                  Varyant Ekle
                </Button>
              </form>
            )}
            {variant === "Ağırlık" && (
              <form
                onSubmit={weightHandleSubmit(onWeightSubmit)}
                className="space-y-4"
              >
                <NumberInput
                  {...weightRegister("value", { setValueAs: (v) => Number(v) })}
                  onChange={(e) => weightSetValue("value", Number(e))}
                  min={0}
                  error={weightError.value?.message}
                  max={Number.MAX_SAFE_INTEGER}
                  label="Ağırlık Giriniz"
                  size="sm"
                  variant="filled"
                />
                <Select
                  {...weightRegister("unit")}
                  onChange={(value) =>
                    weightSetValue("unit", value as WeightUnitType)
                  }
                  data={["ML", "L", "G", "KG"]}
                  error={weightError.unit?.message}
                  variant="filled"
                  label="Tür seçiniz"
                />
                <NumberInput
                  {...weightRegister("price", { setValueAs: (v) => Number(v) })}
                  onChange={(e) => weightSetValue("price", Number(e))}
                  label="Ürün fiyatı"
                  min={0}
                  max={Number.MAX_SAFE_INTEGER}
                  error={weightError.price?.message}
                  variant="filled"
                />
                <NumberInput
                  {...weightRegister("discount", {
                    setValueAs: (v) => Number(v),
                  })}
                  onChange={(e) => weightSetValue("discount", Number(e))}
                  max={100}
                  label="Ürün indirimi"
                  error={weightError.discount?.message}
                  size="sm"
                  variant="filled"
                  min={0}
                />
                <NativeSelect
                  {...weightRegister("active", {
                    setValueAs: (v) => v === "true",
                  })}
                  data={[
                    { label: "Yayında", value: "true" },
                    { label: "Yayında Değil", value: "false" },
                  ]}
                  onChange={(e) =>
                    weightSetValue("active", e.currentTarget.value === "true")
                  }
                  defaultValue="false"
                  error={weightError.active?.message}
                  label="Durum"
                  description="Ürün eklendiğinde gözükmesin isterseniz Yayında değili seçin"
                  variant="filled"
                  size="sm"
                />
                <ImageDropzone
                  name="imageFile"
                  setValue={weightSetValue}
                  trigger={weightTrigger} // form hook'undan trigger'ı da almamız gerekiyor
                  value={weightWatch("imageFile")} // form hook'undan watch'u da almamız gerekiyor
                  error={weightError.imageFile?.message}
                  maxFiles={5}
                  required
                />
                <NumberInput
                  {...weightRegister("stock", { setValueAs: (v) => Number(v) })}
                  onChange={(e) => weightSetValue("stock", Number(e))}
                  label="Ürün Stok"
                  error={weightError.stock?.message}
                  size="sm"
                  variant="filled"
                  min={0}
                  max={Number.MAX_SAFE_INTEGER}
                  description="Ürün stok takibi yapmak için gereklidir"
                />
                <Button
                  type="submit"
                  fullWidth
                  mt={20}
                  disabled={!weightIsValid}
                  loading={weightIsSubmitting}
                >
                  Varyant Ekle
                </Button>
              </form>
            )}
          </Modal>
        </div>
      </div>
      <div className="w-full flex flex-col">
        <h1 className="text-xl font-semibold">Eklenen Varyantlar</h1>
        <ScrollArea>
          <Table miw={800} verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th className="w-[14.28%] text-center">Tip</Table.Th>
                <Table.Th className="w-[14.28%] text-center">Değer</Table.Th>
                <Table.Th className="w-[14.28%] text-center">Fiyat</Table.Th>
                <Table.Th className="w-[14.28%] text-center">İndirim</Table.Th>
                <Table.Th className="w-[14.28%] text-center">Durum</Table.Th>
                <Table.Th className="w-[14.28%] text-center">Stok</Table.Th>
                <Table.Th className="w-[14.28%] text-center">Resimler</Table.Th>
                <Table.Th className="w-[14.28%] text-center">İşlemler</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {variants?.map((variant, index) => (
                <Table.Tr key={index}>
                  <Table.Td>
                    {variant.type === "COLOR" && "Renk"}
                    {variant.type === "SIZE" && "Beden"}
                    {variant.type === "WEIGHT" && "Ağırlık"}
                  </Table.Td>
                  <Table.Td>
                    {variant.type == "COLOR" ? (
                      <ColorSwatch color={variant.value} />
                    ) : variant.type == "SIZE" ? (
                      variant.value
                    ) : variant.type == "WEIGHT" ? (
                      `${variant.value} ${variant.unit}`
                    ) : null}
                  </Table.Td>
                  <Table.Td>{formattedPrice(variant.price)}</Table.Td>
                  <Table.Td>%{variant.discount}</Table.Td>
                  <Table.Td
                    className={
                      variant.active ? "text-green-500" : "text-red-500"
                    }
                  >
                    {variant.active ? "Yayında" : "Yayında Değil"}
                  </Table.Td>
                  <Table.Td>{variant.stock}</Table.Td>
                  <Table.Td>
                    <Button
                      onClick={() =>
                        setOpenModals((prev) => ({ ...prev, [index]: true }))
                      }
                    >
                      Resim
                    </Button>
                    <Modal
                      centered
                      opened={openModals[index] || false}
                      size={500}
                      padding={0}
                      withCloseButton={false}
                      onClose={() =>
                        setOpenModals((prev) => ({ ...prev, [index]: false }))
                      }
                    >
                      <Carousel loop maw={500}>
                        {variant.imageFile.map((image, index) => (
                          <Carousel.Slide key={index}>
                            <Image
                              src={URL.createObjectURL(image)}
                              alt={`image-${index}`}
                              width={500} // Bu değer Next.js için gerekli
                              height={500} // Bu değer Next.js için gerekli
                              style={{
                                width: "100%",
                                height: "auto",
                                maxWidth: rem(500),
                                maxHeight: rem(500),
                                objectFit: "cover",
                              }}
                            />
                          </Carousel.Slide>
                        ))}
                      </Carousel>
                    </Modal>
                  </Table.Td>
                  <Table.Td>
                    <ActionIcon color="red">
                      <FaRegTrashCan
                        onClick={() =>
                          productSetValue(
                            "variants",
                            variants.filter((_, i) => i !== index)
                          )
                        }
                      />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </div>
      <FeedbackDialog
        isOpen={feedbackState.isOpen}
        onClose={() => setFeedbackState((prev) => ({ ...prev, isOpen: false }))}
        message={feedbackState.message}
        type={feedbackState.type}
      />
    </div>
  );
};

export default AddProductForm;
