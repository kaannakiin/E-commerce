"use client";
import {
  Button,
  Group,
  SimpleGrid,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import classes from "./page.module.css";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { ContactUsFormValues, ContactUsSchema } from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateContactUs } from "../action/ContactUsActions";

const InfoForm = () => {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactUsFormValues>({
    resolver: zodResolver(ContactUsSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit: SubmitHandler<ContactUsFormValues> = async (values) => {
    try {
      await CreateContactUs(values).then((res) => {
        if (res.success) {
          setError("root", { type: "disabled", message: res.message });
        } else {
          setError("root", { type: "manual", message: res.message });
        }
      });
    } catch (error) {}
  };
  return (
    <form className={classes.form} onSubmit={handleSubmit(onSubmit)}>
      <Text fz="lg" fw={500} className={classes.title} ff={"heading"}>
        Bizimle iletişime geçin
      </Text>
      <div className={classes.fields}>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <TextInput
                {...field}
                label="Adınız"
                required
                error={errors.name?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <TextInput
                {...field}
                label="E-Posta"
                required
                error={errors.email?.message}
              />
            )}
          />
        </SimpleGrid>
        <Controller
          control={control}
          name="subject"
          render={({ field }) => (
            <TextInput
              {...field}
              mt="md"
              label="Konu"
              required
              error={errors.subject?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="message"
          render={({ field }) => (
            <Textarea
              mt="md"
              {...field}
              label="Mesajınız"
              placeholder="Mesajınızı buraya yazın"
              minRows={3}
              required
              error={errors.message?.message}
            />
          )}
        />
        {errors.root && errors.root.type == "manual" && (
          <Text c="red">{errors.root.message}</Text>
        )}
        {errors.root && errors.root.type == "disabled" && (
          <Text c="green">{errors.root.message}</Text>
        )}
        <Group justify="flex-end" mt="md">
          <Button
            type="submit"
            className={classes.control}
            loading={isSubmitting}
          >
            Gönder
          </Button>
        </Group>
      </div>
    </form>
  );
};

export default InfoForm;
