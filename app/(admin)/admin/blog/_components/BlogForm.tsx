"use client";
import MainLoader from "@/components/MainLoader";
import { slugify } from "@/utils/SlugifyVariants";
import { BlogPostFormValues, BlogPostSchema } from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionIcon,
  Button,
  Card,
  CloseButton,
  Divider,
  Grid,
  Paper,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import CustomDropzone from "../../urunler/_components/CustomDropzone";
import { BlogDelete, BlogEdit, BlogImageDelete } from "../_actions/BlogAction";
import ControlledRichEditor from "./RichEditor";
import { useState } from "react";
import FeedbackDialog from "@/components/FeedbackDialog";
import { useRouter } from "next/navigation";
import { BlogPostDefaultValues } from "../[slug]/page";
import CustomImage from "@/components/CustomImage";
import { FaTrashAlt } from "react-icons/fa";

interface BlogFormProps {
  blog?: BlogPostDefaultValues;
}
const BlogForm = ({ blog }: BlogFormProps) => {
  const [feedbackState, setFeedbackState] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });
  const {
    control,
    watch,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BlogPostFormValues>({
    resolver: zodResolver(BlogPostSchema),
    defaultValues: {
      active: blog?.active || true,
      blog: blog?.Html || "",
      blogDescription: blog?.blogDescription || "",
      blogTitle: blog?.blogTitle || "",
      pageDescription: blog?.pageDescription || "",
      pageTitle: blog?.pageTitle || "",
      authorSurname: blog?.author.split(" ").pop() || "",
      authorName: blog?.author.split(" ").slice(0, -1).join(" ") || "",
    },
  });
  const blogTitle = watch("blogTitle");
  const { refresh, push } = useRouter();
  const onSubmit: SubmitHandler<BlogPostFormValues> = async (data) => {
    try {
      if (data.imageFile.length === 0 && !blog?.image) {
        setError("imageFile", {
          message: "Resim yüklemelisiniz.",
        });
        return;
      }
      await BlogEdit(data, blog?.id ? blog.id : null).then((res) => {
        setFeedbackState((prev) => ({
          ...prev,
          isOpen: true,
          message: res.message,
          type: res.success ? "success" : "error",
        }));
      });
      if (blog) {
        refresh();
      } else {
        push("/admin/blog");
      }
    } catch (error) {
      setFeedbackState((prev) => ({
        ...prev,
        isOpen: true,
        message: "Bir hata oluştu.",
        type: "error",
      }));
    }
  };
  if (isSubmitting) return <MainLoader />;
  return (
    <form className="w-full space-y-4 lg:px-10">
      <div className="flex flex-row items-center justify-end gap-3">
        {blog && (
          <Button
            color="red"
            variant="outline"
            leftSection={<FaTrashAlt size={16} />}
            onClick={async () => {
              await BlogDelete(blog.id).then((res) => {
                if (!res.success) {
                  setFeedbackState((prev) => ({
                    ...prev,
                    isOpen: true,
                    message: res.message,
                    type: "error",
                  }));
                } else {
                  push("/admin/blog");
                }
              });
            }}
          >
            Sil
          </Button>
        )}
        <Button
          onClick={() => {
            setValue("active", false);
            handleSubmit(onSubmit)();
          }}
          variant="outline"
        >
          {blog ? "Taslak Olarak Düzenle" : "Taslak Olarak Kaydet"}
        </Button>
        <Button
          onClick={() => {
            setValue("active", true);
            handleSubmit(onSubmit)();
          }}
        >
          {blog ? "Güncelle" : "Yayınla"}
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="w-full">
          {errors.blog && (
            <div className="text-sm text-red-500">{errors.blog.message}</div>
          )}
          <ControlledRichEditor<BlogPostFormValues>
            control={control}
            name="blog"
            isWithImage
          />
        </div>
        <div className="w-full">
          <div className="flex flex-col space-y-4">
            <Controller
              name="blogTitle"
              control={control}
              render={({ field }) => (
                <TextInput
                  label="Başlık"
                  withAsterisk
                  error={errors.blogTitle?.message}
                  {...field}
                />
              )}
            />
            <Controller
              name="blogDescription"
              control={control}
              render={({ field }) => (
                <Textarea
                  label="Kısa açıklama"
                  withAsterisk
                  error={errors.blogDescription?.message}
                  {...field}
                />
              )}
            />
            <Grid>
              <Grid.Col span={6}>
                <Controller
                  control={control}
                  name="authorName"
                  render={({ field }) => (
                    <TextInput
                      label="Yazar Adı"
                      withAsterisk
                      {...field}
                      error={errors.authorName?.message}
                    />
                  )}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Controller
                  control={control}
                  name="authorSurname"
                  render={({ field }) => (
                    <TextInput
                      label="Yazar Soyadı"
                      withAsterisk
                      {...field}
                      error={errors.authorSurname?.message}
                    />
                  )}
                />
              </Grid.Col>
            </Grid>
            {blog?.image ? (
              <div className="relative h-96 w-full">
                <ActionIcon
                  variant="default"
                  className="absolute right-2 top-2 z-10"
                  onClick={async () => {
                    try {
                      await BlogImageDelete(blog.image.url).then((res) => {
                        if (res.success) {
                          refresh();
                        } else {
                          setFeedbackState((prev) => ({
                            ...prev,
                            isOpen: true,
                            message: res.message,
                            type: "error",
                          }));
                        }
                      });
                    } catch (error) {}
                  }}
                >
                  <CloseButton />
                </ActionIcon>
                <CustomImage
                  src={blog.image.url}
                  quality={40}
                  objectFit="contain"
                />
              </div>
            ) : (
              <CustomDropzone control={control} maxFiles={1} name="imageFile" />
            )}
            <Card withBorder shadow="xs">
              <h6 className="font-semibold">Seo Ayarları</h6>
              <Divider size={"sm"} my={4} />
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <TextInput
                    disabled
                    label="Slug"
                    value={"/blog/" + slugify(blogTitle || "")}
                  />
                  <Controller
                    name="pageTitle"
                    control={control}
                    render={({ field: { value, onChange, ...field } }) => (
                      <Textarea
                        label="Sayfa Başlığı"
                        error={errors.pageTitle?.message}
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value || null)}
                        {...field}
                      />
                    )}
                  />

                  <Controller
                    name="pageDescription"
                    control={control}
                    render={({ field: { value, onChange, ...field } }) => (
                      <Textarea
                        label="Sayfa Açıklaması"
                        error={errors.pageDescription?.message}
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value || null)}
                        {...field}
                      />
                    )}
                  />
                </div>
                <Paper p="md" radius="md" withBorder>
                  <Text size="sm" fw={500} c="dimmed" mb="sm">
                    Google Önizleme
                  </Text>
                  <div className="flex flex-col">
                    <Text
                      component="a"
                      href="#"
                      className="truncate text-lg text-[#1a0dab] no-underline hover:underline"
                    >
                      {watch("pageTitle") ||
                        watch("blogTitle") ||
                        "Sayfa Başlığı"}
                    </Text>

                    <Text size="sm" className="mt-1 truncate text-[#006621]">
                      {typeof window !== "undefined" &&
                        process.env.NEXT_PUBLIC_APP_URL}
                      /blog/
                      {slugify(watch("blogTitle") || "")}
                    </Text>

                    <Text size="sm" c="dimmed" className="mt-1 line-clamp-2">
                      {watch("pageDescription") ||
                        watch("blogDescription") ||
                        "Sayfa açıklaması buraya gelecek..."}
                    </Text>
                  </div>
                </Paper>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <FeedbackDialog
        isOpen={feedbackState.isOpen}
        onClose={() => setFeedbackState((prev) => ({ ...prev, isOpen: false }))}
        message={feedbackState.message}
        type={feedbackState.type}
      />
    </form>
  );
};

export default BlogForm;
