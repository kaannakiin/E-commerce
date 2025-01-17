"use client";
import {
  UpdatePasswordSchema,
  UpdatePasswordType,
  updateUserInfo,
  UpdateUserInfoType,
} from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Card,
  Grid,
  InputBase,
  Modal,
  PasswordInput,
  PinInput,
  TextInput,
  Title,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { IMaskInput } from "react-imask";
import { UpdatePassword, UpdateUser } from "../_actions/UserAction";
import FeedbackDialog from "@/components/FeedbackDialog";
import { useRouter } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
interface UserInfoFormProps {
  email: string;
  name: string;
  surname: string;
  phone: string;
  emailVerified: Date | null;
}
const UserInfoForm = ({
  email,
  name,
  phone,
  surname,
  emailVerified,
}: UserInfoFormProps) => {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });
  const [countdown, setCountdown] = useState(0);
  const [opened, { open, close }] = useDisclosure(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateUserInfoType>({
    resolver: zodResolver(updateUserInfo),
    defaultValues: { email, name, phone, surname },
  });
  const {
    control: registerControl,
    handleSubmit: registerHandleSubmit,
    reset: registerReset,
    formState: {
      errors: registerErrors,
      isSubmitting: registerIsSubmitting,
      isDirty: registerIsDirty,
    },
  } = useForm<UpdatePasswordType>({
    resolver: zodResolver(UpdatePasswordSchema),
    defaultValues: { newPassword: "", oldPassword: "", newPasswordConfirm: "" },
  });
  const { refresh } = useRouter();
  const onSubmit: SubmitHandler<UpdateUserInfoType> = async (
    data: UpdateUserInfoType,
  ) => {
    const res = await UpdateUser(data);
    if (res.success) {
      setDialogState({ isOpen: true, message: res.message, type: "success" });
    } else {
      setDialogState({ isOpen: true, message: res.message, type: "error" });
    }
    refresh();
    reset(
      {
        email: data.email,
        name: data.name,
        phone: data.phone,
        surname: data.surname,
      },
      { keepValues: false },
    );
  };
  const onPasswordSubmit: SubmitHandler<UpdatePasswordType> = async (
    data: UpdatePasswordType,
  ) => {
    const res = await UpdatePassword(data);
    if (res.success) {
      setDialogState({ isOpen: true, message: res.message, type: "success" });
    } else {
      setDialogState({ isOpen: true, message: res.message, type: "error" });
    }
    registerReset();
    refresh();
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);
  const handleResendCode = () => {
    console.log("Resend code");
    setCountdown(180);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleVerifyCode = (code: string) => {
    console.log("Verifying code:", code);
  };
  return (
    <div>
      <Card
        padding={"md"}
        withBorder
        className="flex w-full flex-row items-center justify-between"
      >
        <Title order={4} c={"primary.9"}>
          Kullanıcı Bilgilerim
        </Title>
        {emailVerified && (
          <Button
            onClick={() => {
              open();
              handleResendCode();
            }}
          >
            E-posta onayla
          </Button>
        )}
      </Card>
      <div className="flex flex-col gap-2 md:flex-row md:gap-0">
        <Card
          padding={"md"}
          withBorder
          className="mt-4 w-full space-y-1 md:w-1/2"
        >
          <div className="space-y-4">
            <Title order={5} c={"secondary.9"}>
              Üyelik Bilgilerim
            </Title>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
              <Grid className="gap-4">
                <Grid.Col span={6}>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        label="Ad"
                        classNames={{ label: "font-semibold" }}
                        error={errors.name?.message}
                        {...field}
                      />
                    )}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Controller
                    name="surname"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        label="Soyad"
                        classNames={{ label: "font-semibold" }}
                        error={errors.surname?.message}
                        {...field}
                      />
                    )}
                  />
                </Grid.Col>
              </Grid>

              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextInput
                    label="E-posta"
                    type="email"
                    classNames={{ label: "font-semibold" }}
                    error={errors.email?.message}
                    {...field}
                  />
                )}
              />

              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <InputBase
                    component={IMaskInput}
                    mask="(000) 000 00 00"
                    label="Telefon Numarası"
                    classNames={{ label: "font-semibold" }}
                    error={errors.phone?.message}
                    {...field}
                  />
                )}
              />

              <Button
                loading={isSubmitting}
                variant="light"
                fullWidth
                className={`${!isDirty && "cursor-not-allowed"}`}
                disabled={!isDirty}
                type="submit"
              >
                Kaydet
              </Button>
            </form>
          </div>
        </Card>
        <Card
          padding={"md"}
          withBorder
          className="mt-4 w-full space-y-1 md:w-1/2"
        >
          <div className="space-y-4">
            <Title order={4} c={"secondary.9"}>
              Şifre Sıfırla
            </Title>
            <form
              onSubmit={registerHandleSubmit(onPasswordSubmit)}
              className="space-y-2"
            >
              <Controller
                name="oldPassword"
                control={registerControl}
                render={({ field }) => (
                  <PasswordInput
                    label="Eski Şifreniz"
                    classNames={{ label: "font-semibold" }}
                    error={registerErrors.oldPassword?.message}
                    {...field}
                  />
                )}
              />
              <Controller
                name="newPassword"
                control={registerControl}
                render={({ field }) => (
                  <PasswordInput
                    label="Yeni Şifre"
                    classNames={{ label: "font-semibold" }}
                    error={registerErrors.newPassword?.message}
                    {...field}
                  />
                )}
              />
              <Controller
                name="newPasswordConfirm"
                control={registerControl}
                render={({ field }) => (
                  <PasswordInput
                    label="Yeni Şifre Tekrarı"
                    classNames={{ label: "font-semibold" }}
                    error={registerErrors.newPasswordConfirm?.message}
                    {...field}
                  />
                )}
              />
              <Button
                type="submit"
                fullWidth
                loading={registerIsSubmitting}
                disabled={!registerIsDirty}
                className={`${!registerIsDirty && "cursor-not-allowed"}`}
              >
                Güncelle
              </Button>
            </form>
          </div>
        </Card>
      </div>
      <FeedbackDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
        message={dialogState.message}
        type={dialogState.type}
        autoCloseDelay={3000}
      />
      {emailVerified && (
        <Modal
          opened={opened}
          onClose={close}
          centered
          title="E-posta Doğrulama"
          classNames={{
            title: "text-center font-semibold text-xl",
          }}
          overlayProps={{
            backgroundOpacity: 0.55,
            blur: 3,
          }}
        >
          <div className="flex flex-col items-center space-y-6 p-4">
            <div className="space-y-2 text-center">
              <p className="text-sm text-gray-600">
                {email} adresine gönderilen 6 haneli doğrulama kodunu giriniz
              </p>
            </div>

            <PinInput
              size="lg"
              length={6}
              type="number"
              className="justify-center"
              placeholder=""
              onChange={(value) => {
                handleVerifyCode(value);
              }}
            />

            <div className="space-y-4 text-center">
              <p className="text-sm text-gray-500">
                Kod gelmedi mi?
                <Button
                  variant="subtle"
                  disabled={countdown > 0}
                  onClick={handleResendCode}
                >
                  {countdown > 0 ? `${formatTime(countdown)}` : "Tekrar Gönder"}
                </Button>
              </p>

              <Button
                fullWidth
                size="md"
                className="mt-4"
                onClick={() => {
                  // Doğrulama butonu işlemi
                  console.log("Verify code");
                }}
              >
                Doğrula
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UserInfoForm;
