"use client";
import React, { useState, useEffect } from "react";
import MainLoader from "@/components/MainLoader";
import {
  forgotPasswordSchema,
  ForgotPasswordSchemaType,
} from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, TextInput, Text } from "@mantine/core";
import Link from "next/link";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { ResetPassword } from "../_actions/ResetPassword";

const ForgotForm = () => {
  const [countdown, setCountdown] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setShowSuccess(false);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const onSubmit: SubmitHandler<ForgotPasswordSchemaType> = async (data) => {
    const res = await ResetPassword(data);
    if (res.success) {
      setShowSuccess(true);
      setCountdown(300); // 5 dakika (300 saniye)
    }
  };

  if (isSubmitting) return <MainLoader />;

  return (
    <div className="flex min-h-[200px] flex-col items-center justify-start p-4 pt-8">
      <h1 className="text-center text-2xl font-bold">Şifre Yenileme</h1>
      <p className="mt-2 text-center font-semibold text-gray-500">
        E-posta adresinize göndereceğimiz bağlantı ile güvenli bir şekilde yeni
        şifrenizi oluşturabilirsiniz.
      </p>
      <div className="mt-2 w-full max-w-md rounded-lg bg-white px-5 py-8 shadow-lg">
        {showSuccess ? (
          <div className="text-center">
            <Text className="mb-4 font-medium text-green-600">
              E-posta gönderilmiştir. Lütfen gelen kutunuzu kontrol ediniz.
            </Text>
            <Text className="text-gray-600">
              {countdown > 0
                ? `Yeni bir istek göndermek için ${formatTime(countdown)} dakika bekleyiniz.`
                : "Şimdi yeni bir istek gönderebilirsiniz."}
            </Text>
          </div>
        ) : (
          <form
            className="flex w-full flex-col space-y-2"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <TextInput
                  {...field}
                  label="E-Posta"
                  variant="filled"
                  withAsterisk
                  type="email"
                  error={errors.email?.message}
                />
              )}
            />
            <Button type="submit" disabled={countdown > 0}>
              Şifremi Yenile
            </Button>
            <Button
              component={Link}
              variant="outline"
              href={`/giris?tab=giris&callbackUrl=${encodeURIComponent("/")}`}
            >
              Giriş Yap
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotForm;