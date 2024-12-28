"use client";
import MainLoader from "@/components/MainLoader";
import {
  passwordCheckSchema,
  PasswordCheckType,
} from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, PasswordInput } from "@mantine/core";
import React from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { resetPasswordCheck } from "../_actions/ResetPassword";
import { useRouter } from "next/navigation";
type props = {
  slug: string;
};
const ForgotCheckForm = (props: props) => {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PasswordCheckType>({
    resolver: zodResolver(passwordCheckSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  const { push } = useRouter();
  const onSubmit: SubmitHandler<PasswordCheckType> = async (data) => {
    await resetPasswordCheck(props.slug, data).then((res) => {
      if (res.success) {
        push(`/giris?tab=giris&callbackUrl=${encodeURIComponent("/")}`);
      } else {
        setError("confirmPassword", { message: res.message });
      }
    });
  };
  if (isSubmitting) return <MainLoader />;
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-start p-4 pt-8">
      <h1 className="text-center text-2xl font-bold">Şifre Yenileme</h1>

      <div className="mt-2 w-full max-w-md rounded-lg bg-white px-5 py-8 shadow-lg">
        <form className="w-full space-y-2" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <PasswordInput
                {...field}
                label="Yeni Şifre"
                variant="filled"
                error={errors?.password?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <PasswordInput
                {...field}
                label="Yeni Şifre"
                variant="filled"
                error={errors?.confirmPassword?.message}
              />
            )}
          />
          <Button type="submit" fullWidth>
            Kaydet
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ForgotCheckForm;
