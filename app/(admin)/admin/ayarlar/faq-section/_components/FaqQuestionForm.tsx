"use client";

import {
  FaqQuestionFormValues,
  FaqQuestionSchema,
} from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Stack, Switch, Textarea, TextInput } from "@mantine/core";
import { useForm, Controller } from "react-hook-form";
import ControlledRichEditor from "../../../blog/_components/RichEditor";
interface FaqQuestionFormProps {
  onSubmit?: (data: FaqQuestionFormValues) => void;
  onClose?: () => void;
  defaultValues?: FaqQuestionFormValues;
}
const FaqQuestionForm = ({
  onClose,
  onSubmit,
  defaultValues,
}: FaqQuestionFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FaqQuestionFormValues>({
    resolver: zodResolver(FaqQuestionSchema),
    defaultValues: {
      question: defaultValues?.question || "",
      answer: defaultValues?.answer || "",
      active: defaultValues?.active || true,
    },
  });

  const handleFormSubmit = async (data: FaqQuestionFormValues) => {
    try {
      onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Stack gap="md">
        <Controller
          control={control}
          name="question"
          render={({ field }) => (
            <TextInput
              {...field}
              error={errors.question?.message}
              label="Soru"
              placeholder="Sorunuzu buraya yazın"
              description="Başlık şeklinde gözükecektir"
              withAsterisk
            />
          )}
        />
        <ControlledRichEditor
          control={control}
          name="answer"
          isWithImage={false}
        />
        <Controller
          control={control}
          name="active"
          render={({ field: { value, onChange, ...field } }) => (
            <div className="flex items-center gap-2">
              <Switch
                size="md"
                onLabel="ON"
                offLabel="OFF"
                checked={value}
                onChange={(event) => onChange(event.currentTarget.checked)}
                {...field}
                label="Aktif/Pasif"
              />
            </div>
          )}
        />

        <Button type="submit" loading={isSubmitting} fullWidth>
          Soru Ekle
        </Button>
      </Stack>
    </form>
  );
};

export default FaqQuestionForm;
