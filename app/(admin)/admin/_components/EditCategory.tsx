"use client";

import { EditCategoryBySlug } from "@/actions/admin/categories/edit-category";
import FeedbackDialog from "@/components/FeedbackDialog";
import { CategoryFormValues } from "@/types/types";
import {
  EditCategorySchema,
  EditCategorySchemaType,
} from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Divider,
  Group,
  Paper,
  Stack,
  Switch,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { SubmitHandler, useForm } from "react-hook-form";
import CarouselEditImage from "../kategoriler/_components/CarouselEditImage";
import ImageDropzone from "./ImageDropzone";
import { useState } from "react";
import { useRouter } from "next/navigation";

const EditCategory = ({ category, categorySlug }) => {
  const [dialogState, setDialogState] = useState<{
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
    register,
    handleSubmit,
    setValue,
    trigger,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(EditCategorySchema),
    defaultValues: {
      name: category?.name || "",
      description: category?.description || "",
      active: category?.active,
    },
  });
  const watchImageFile = watch("imageFile");
  const onSubmit: SubmitHandler<EditCategorySchemaType> = async (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("active", data.active.toString());
    data.imageFile?.forEach((file) => {
      formData.append("imageFile", file);
    });
    await EditCategoryBySlug(formData, categorySlug).then((res) => {
      if (res.success) {
        setDialogState({
          isOpen: true,
          message: res.message,
          type: "success",
        });
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
    <Box className="w-full p-4 md:p-6">
      <Paper shadow="xs" radius="md" className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-6 p-6 md:flex-row">
          {/* LEFT SECTION - Image */}
          <div className="w-full md:w-72">
            <Paper shadow="sm" radius="md" className="sticky top-6">
              <div className="relative aspect-square w-full">
                <CarouselEditImage images={category?.Image || []} />
              </div>
            </Paper>
          </div>
          <div className="flex-1">
            <Stack>
              <div>
                <Title order={2} size="h3" fw={600}>
                  Kategori Detayları{" "}
                </Title>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack>
                  <TextInput
                    label="Category Name"
                    placeholder="Enter category name"
                    {...register("name")}
                    error={errors.name?.message}
                    className="max-w-xl"
                  />

                  <Textarea
                    label="Description"
                    placeholder="Enter category description"
                    minRows={3}
                    {...register("description")}
                    error={errors.description?.message}
                    className="max-w-xl"
                  />
                  <Switch
                    label="Active Status"
                    description="Enable or disable this category"
                    defaultChecked={category?.active}
                    error={errors.active?.message}
                    {...register("active")}
                    className="max-w-xl"
                  />
                  <ImageDropzone<CategoryFormValues>
                    name="imageFile"
                    value={watchImageFile}
                    setValue={setValue}
                    trigger={trigger}
                    maxFiles={5}
                    error={errors.imageFile?.message}
                    required
                  />
                  <Divider my="lg" />

                  <Group justify="flex-end" mt="xl">
                    <Button
                      type="submit"
                      variant="filled"
                      loading={isSubmitting}
                      disabled={!isValid}
                    >
                      Save Changes
                    </Button>
                  </Group>
                </Stack>
              </form>
            </Stack>
          </div>
        </div>
      </Paper>{" "}
      <FeedbackDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
        message={dialogState.message}
        type={dialogState.type}
      />
    </Box>
  );
};

export default EditCategory;
