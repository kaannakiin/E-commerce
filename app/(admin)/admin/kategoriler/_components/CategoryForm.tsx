"use client";
import FeedbackDialog from "@/components/FeedbackDialog";
import MainLoader from "@/components/MainLoader";
import { slugify } from "@/utils/SlugifyVariants";
import {
  CategoryEditableFormValues,
  CategoryEditableSchema,
} from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  Combobox,
  Paper,
  Pill,
  PillsInput,
  Text,
  Textarea,
  TextInput,
  useCombobox,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { searchGoogleCategories } from "../../urunler/_actions/ProductActions";
import CustomDropzone from "../../urunler/_components/CustomDropzone";
import GoogleCategorySelector from "../../urunler/_components/GoogleSelect";
import { googleType } from "../../urunler/urun-ekle/page";
import { CategoryFormDefault } from "../[slug]/page";
import { CreateCategoryDB, UpdateCategoryDB } from "../_actions/CategoryAction";
import ImageWithDelete from "./ImageWithDelete";
import { IoAlertCircleOutline } from "react-icons/io5";

type FormProps = {
  defaultValues?: CategoryFormDefault;
  slug?: string;
  googleCategories: googleType[];
  onClosed?: () => void;
};

const EditableCategoryForm = ({
  defaultValues,
  slug,
  googleCategories,
  onClosed,
}: FormProps) => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CategoryEditableFormValues>({
    resolver: zodResolver(CategoryEditableSchema),
    defaultValues: {
      active: defaultValues?.active || false,
      description: defaultValues?.description || "",
      googleCategories: defaultValues?.googleCategoryId?.toString() || "",
      metaDescription: defaultValues?.metaDescription || "",
      metaTitle: defaultValues?.metaTitle || "",
      name: defaultValues?.name || "",
      imageFiles: [],
      metaKeywords: defaultValues?.metaKeywords || "",
    },
  });
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const { push, refresh } = useRouter();
  const onSubmit: SubmitHandler<CategoryEditableFormValues> = async (data) => {
    const formData = {
      ...data,
      metaKeywords: data.metaKeywords || "",
    };

    if (!slug) {
      await CreateCategoryDB(formData).then((res) => {
        if (res.success) {
          setDialogState({
            isOpen: true,
            message: res.message,
            type: "success",
          });
          push("/admin/kategoriler");
        } else {
          setDialogState({
            isOpen: true,
            message: res.message,
            type: "error",
          });
        }
      });
    } else {
      await UpdateCategoryDB(formData, slug).then((res) => {
        if (res.success) {
          setDialogState({
            isOpen: true,
            message: res.message,
            type: "success",
          });
          push("/admin/kategoriler");
        } else {
          setDialogState({
            isOpen: true,
            message: res.message,
            type: "error",
          });
        }
      });
    }
    if (onClosed) {
      onClosed();
    }
  };
  const handleFormSubmit = (isActive: boolean) => {
    return handleSubmit((data) => {
      return onSubmit({
        ...data,
        active: isActive,
      });
    });
  };
  const handleDialogClose = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };
  const metaTitle = watch("metaTitle");
  const metaDescription = watch("metaDescription");
  const categorySlug = slugify(watch("name") || "");
  if (isSubmitting) return <MainLoader />;
  return (
    <Box
      className="mx-auto max-w-3xl p-6"
      component="form"
      onSubmit={(e: React.FormEvent) => {
        const target = e.target as HTMLFormElement;
        if (!target.querySelector(":focus")) {
          e.preventDefault();
          return false;
        }
      }}
    >
      <Alert
        variant="filled"
        color="gray"
        title="Uyarı"
        icon={<IoAlertCircleOutline />}
      >
        Ürün Eklenmemiş kategoriler aktif olarak sitenizde gözükmeyecektir.
        Lütfen ürün ekleyerek kategorinizi aktif hale getirin.
      </Alert>
      <div className="mt-4 flex items-center justify-end gap-3">
        <Button
          variant="outline"
          type="submit"
          onClick={handleFormSubmit(false)}
        >
          Taslak Olarak Kaydet
        </Button>
        <Button type="submit" onClick={handleFormSubmit(true)}>
          Kaydet
        </Button>
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextInput
                label="Kategori Adı"
                placeholder="Kategori adını giriniz"
                error={errors.name?.message}
                required
                {...field}
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Textarea
                label="Açıklama"
                placeholder="Kategori açıklamasını giriniz"
                error={errors.description?.message}
                required
                minRows={3}
                {...field}
              />
            )}
          />
          {defaultValues?.images.length > 0 ? (
            <ImageWithDelete
              slug={slug}
              src={defaultValues.images[0].url}
              onDeleteSuccess={() => {
                refresh();
              }}
            />
          ) : (
            <div>
              <p className="text-sm text-gray-600">
                Resim Eklemeden devam ederseniz ana ekranda kategorinizin
                görünümü kötü olabilir. Lütfen resimsiz kategorilerinizi taslak
                olarak kaydedin.
              </p>
              <CustomDropzone
                control={control}
                name="imageFiles"
                maxFiles={1}
                isForce={false}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="text-sm font-medium">SEO Bilgileri</div>
          <Controller
            name="metaTitle"
            control={control}
            render={({ field }) => (
              <TextInput
                withAsterisk
                label="Meta Başlık"
                placeholder="Meta başlık giriniz"
                error={errors.metaTitle?.message}
                {...field}
              />
            )}
          />
          <Controller
            name="metaDescription"
            control={control}
            render={({ field }) => (
              <Textarea
                label="Meta Açıklama"
                withAsterisk
                placeholder="Meta açıklama giriniz"
                error={errors.metaDescription?.message}
                {...field}
              />
            )}
          />
          <TextInput
            disabled
            description="Bu linki paylaşarak kategorinizi tanıtabilirsiniz."
            value={`${process.env.NEXT_PUBLIC_APP_URL}/${categorySlug}`}
          />
          <Controller
            name="metaKeywords"
            control={control}
            render={({ field, fieldState }) => {
              const currentValues = field.value
                ? field.value.split(",").filter(Boolean)
                : [];

              const handleValueSelect = (val: string) => {
                if (val.trim().length > 0 && !currentValues.includes(val)) {
                  const newValues = [...currentValues, val];
                  field.onChange(newValues.join(",")); // Array'i string'e çevir
                }
              };

              const handleValueRemove = (val: string) => {
                const newValues = currentValues.filter(
                  (v: string) => v !== val,
                );
                field.onChange(newValues.join(",")); // Array'i string'e çevir
              };
              return (
                <Combobox store={combobox} onOptionSubmit={handleValueSelect}>
                  <Combobox.Target>
                    <PillsInput
                      label="Meta Anahtar Kelimeler"
                      onClick={() => combobox.openDropdown()}
                      error={fieldState.error?.message}
                    >
                      <Pill.Group>
                        {currentValues.map((item: string) => (
                          <Pill
                            key={item}
                            onRemove={() => handleValueRemove(item)}
                            withRemoveButton
                          >
                            {item}
                          </Pill>
                        ))}
                        <Combobox.EventsTarget>
                          <PillsInput.Field
                            placeholder="Anahtar kelime giriniz"
                            onKeyDown={(event) => {
                              if (
                                event.key === "Enter" &&
                                event.currentTarget.value.trim().length > 0
                              ) {
                                event.preventDefault();
                                handleValueSelect(event.currentTarget.value);
                                event.currentTarget.value = "";
                                combobox.closeDropdown();
                              }
                            }}
                          />
                        </Combobox.EventsTarget>
                      </Pill.Group>
                    </PillsInput>
                  </Combobox.Target>
                  <Combobox.Dropdown>
                    <Combobox.Options>
                      <Combobox.Empty>Anahtar kelime giriniz</Combobox.Empty>
                    </Combobox.Options>
                  </Combobox.Dropdown>
                </Combobox>
              );
            }}
          />
          <Paper p="md" withBorder>
            <Text size="sm" fw={500} c="dimmed" mb="sm">
              Google Önizleme
            </Text>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <Text
                size="lg"
                style={{
                  color: "#1a0dab",
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                {metaTitle || "sayfa-basligi"}
              </Text>

              <Text size="sm" style={{ color: "#006621" }}>
                {metaDescription || "sayfa-basligi"}
              </Text>

              <Text size="sm" c="dimmed" style={{ maxWidth: "600px" }}>
                &quot;Sayfa açıklaması buraya gelecek...&quot;
              </Text>
            </div>
          </Paper>
          <GoogleCategorySelector
            control={control}
            onSearch={searchGoogleCategories}
            initialCategories={googleCategories}
          />
        </div>
      </div>
      <FeedbackDialog
        isOpen={dialogState.isOpen}
        onClose={handleDialogClose}
        message={dialogState.message}
        type={dialogState.type}
        autoCloseDelay={2000}
      />
    </Box>
  );
};

export default EditableCategoryForm;
