"use client";
import {
  NoReplyEmailSettingsSchema,
  NoReplyEmailSettingsType,
} from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Card,
  Grid,
  NumberInput,
  PasswordInput,
  TextInput,
} from "@mantine/core";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { EmailSettingsAction } from "../_actions/EmailAction";
interface EmailSettingsFormProps {
  email: string;
  password: string;
  port: number;
  host: string;
}
const EmailSettingsForm = ({
  data,
}: {
  data: EmailSettingsFormProps | null;
}) => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<NoReplyEmailSettingsType>({
    resolver: zodResolver(NoReplyEmailSettingsSchema),
    defaultValues: data
      ? {
          email: data.email,
          password: data.password,
          port: data.port,
          host: data.host,
        }
      : {
          email: "",
          password: "",
          port: 0,
          host: "",
        },
  });

  const onSubmit: SubmitHandler<NoReplyEmailSettingsType> = async (
    data: NoReplyEmailSettingsType,
  ) => {
    await EmailSettingsAction(data);
    // Submit logic here
  };

  return (
    <Card withBorder shadow="md">
      <p className="text-sm font-semibold text-gray-500">
        E-posta sunucu ayarlarınızı buradan düzenleyebilirsiniz. Buradaki
        ayarlar siparişleriniz ve kargo durumları hakkında müşterilerinizi
        bilgilendirmek için kullanılır. E-posta ayarlarınızı lütfen dikkatli bir
        şekilde yapınız. E-Posta sunucunuzdan dönüş yapılmayı kapatabilirsiniz.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Grid>
          <Grid.Col span={6}>
            <Controller
              name="port"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <NumberInput
                  label="Port"
                  hideControls
                  min={0}
                  classNames={{
                    label: "font-bold",
                  }}
                  error={error?.message}
                  {...field}
                />
              )}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Controller
              name="host"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextInput
                  label="Host"
                  classNames={{
                    label: "font-bold",
                  }}
                  error={error?.message}
                  {...field}
                />
              )}
            />
          </Grid.Col>
        </Grid>
        <Grid>
          <Grid.Col span={6}>
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextInput
                  label="Kullanıcı Adı"
                  classNames={{
                    label: "font-bold",
                  }}
                  error={error?.message}
                  {...field}
                />
              )}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Controller
              name="password"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <PasswordInput
                  label="Şifre"
                  classNames={{
                    label: "font-bold",
                  }}
                  error={error?.message}
                  {...field}
                />
              )}
            />
          </Grid.Col>
        </Grid>
        <div className="flex justify-end">
          <Button loading={isSubmitting} type="submit">
            Kaydet
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default EmailSettingsForm;
