"use client";
import { Login } from "@/actions/login";
import { Register } from "@/actions/register";
import {
  LoginSchema,
  LoginSchemaType,
  RegisterSchema,
  RegisterSchemaType,
} from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  InputBase,
  PasswordInput,
  Switch,
  Tabs,
  Text,
  TextInput,
} from "@mantine/core";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { IMaskInput } from "react-imask";
import MainLoader from "./MainLoader";

export function AuthenticationImage() {
  const params = useSearchParams();
  const pathname = usePathname();
  const callbackUrl = decodeURIComponent(params.get("callbackUrl") || "/");
  const { replace, push } = useRouter();

  // Login Form Controller
  const {
    control: loginControl,
    handleSubmit: LoginHandleSubmit,
    setError: LoginSetError,
    reset: LoginReset,
    formState: { errors: LoginErrors, isSubmitting: LoginIsSubmitting },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Register Form Controller
  const {
    control: registerControl,
    handleSubmit: RegisterHandleSubmit,
    setError: RegisterSetError,
    reset: RegisterReset,
    formState: { errors: RegisterErrors, isSubmitting: RegisterIsSubmitting },
  } = useForm<RegisterSchemaType>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      name: "",
      surname: "",
      phone: "",
      password: "",
      confirmPassword: "",
      termsAndPrivacyPolicy: false,
    },
  });

  // Tab Change Handler
  const onTabChange = (value: string) => {
    const newUrl = new URLSearchParams(params.toString());
    newUrl.set("tab", value);
    replace(`${pathname}?${newUrl.toString()}`);
    if (value === "giris") {
      LoginReset();
    } else {
      RegisterReset();
    }
  };

  // Login Submit Handler
  const onSubmitLogin: SubmitHandler<LoginSchemaType> = async (data) => {
    try {
      const res = await Login(data);
      if (res.success) {
        push(callbackUrl);
      } else {
        LoginSetError("root", {
          message: res.message,
        });
      }
    } catch (error) {
      LoginSetError("root", {
        message: "Giriş sırasında bir hata oluştu",
      });
    }
  };
  const onSubmitRegister: SubmitHandler<RegisterSchemaType> = async (data) => {
    await Register(data).then(async (res) => {
      if (res.success) {
        await Login({ email: data.email, password: data.password }).then(
          (res) => {
            if (res.success) push(callbackUrl);
          },
        );
      }
      if (res.error) {
        RegisterSetError("root", {
          message:
            typeof res.error === "string"
              ? res.error
              : "Bilinmeyen bir hata oluştu",
        });
      }
    });
  };

  return (
    <div className="flex min-h-[800px] items-start justify-center p-4 pt-8">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <Tabs
          defaultValue={params.get("tab") || "giris"}
          onChange={onTabChange}
        >
          <Tabs.List grow className="mb-6 font-bold">
            <Tabs.Tab value="giris">Giriş Yap</Tabs.Tab>
            <Tabs.Tab value="kayit">Kayıt Ol</Tabs.Tab>
          </Tabs.List>
          <div className="min-h-[250px]">
            {LoginIsSubmitting || RegisterIsSubmitting ? (
              <Tabs.Panel
                value="giris"
                className="flex h-full items-center justify-center"
              >
                <MainLoader />
              </Tabs.Panel>
            ) : (
              <>
                <Tabs.Panel value="giris" className="mt-4 space-y-4">
                  <form
                    onSubmit={LoginHandleSubmit(onSubmitLogin)}
                    className="space-y-4"
                  >
                    <Controller
                      name="email"
                      control={loginControl}
                      render={({ field, fieldState }) => (
                        <TextInput
                          {...field}
                          error={fieldState.error?.message}
                          label="Email"
                          size="sm"
                          withAsterisk
                        />
                      )}
                    />

                    <Controller
                      name="password"
                      control={loginControl}
                      render={({ field, fieldState }) => (
                        <PasswordInput
                          {...field}
                          error={fieldState.error?.message}
                          label="Şifre"
                          size="sm"
                          withAsterisk
                        />
                      )}
                    />

                    {LoginErrors.root && (
                      <p className="text-sm text-red-500">
                        {LoginErrors.root.message}
                      </p>
                    )}

                    <div className="text-end">
                      <Text
                        component={Link}
                        href="/sifremi-unuttum"
                        className="text-sm hover:underline"
                      >
                        Şifremi unuttum
                      </Text>
                    </div>

                    <Button fullWidth size="sm" type="submit">
                      Giriş Yap
                    </Button>
                  </form>
                </Tabs.Panel>

                <Tabs.Panel value="kayit" className="mt-4 space-y-4">
                  <form
                    onSubmit={RegisterHandleSubmit(onSubmitRegister)}
                    className="space-y-4"
                  >
                    <Controller
                      name="email"
                      control={registerControl}
                      render={({ field, fieldState }) => (
                        <TextInput
                          {...field}
                          error={fieldState.error?.message}
                          label="Email"
                          size="sm"
                          withAsterisk
                        />
                      )}
                    />

                    <Controller
                      name="name"
                      control={registerControl}
                      render={({ field, fieldState }) => (
                        <TextInput
                          {...field}
                          error={fieldState.error?.message}
                          label="Adınız"
                          size="sm"
                          withAsterisk
                        />
                      )}
                    />

                    <Controller
                      name="surname"
                      control={registerControl}
                      render={({ field, fieldState }) => (
                        <TextInput
                          {...field}
                          error={fieldState.error?.message}
                          label="Soyadınız"
                          size="sm"
                          withAsterisk
                        />
                      )}
                    />

                    <Controller
                      name="phone"
                      control={registerControl}
                      render={({ field, fieldState }) => (
                        <InputBase
                          component={IMaskInput}
                          {...field}
                          error={fieldState.error?.message}
                          mask="(000) 000 00 00"
                          label="Telefon Numarası"
                          size="sm"
                        />
                      )}
                    />

                    <Controller
                      name="password"
                      control={registerControl}
                      render={({ field, fieldState }) => (
                        <PasswordInput
                          {...field}
                          error={fieldState.error?.message}
                          label="Şifre"
                          size="sm"
                          withAsterisk
                        />
                      )}
                    />

                    <Controller
                      name="confirmPassword"
                      control={registerControl}
                      render={({ field, fieldState }) => (
                        <PasswordInput
                          {...field}
                          error={fieldState.error?.message}
                          label="Şifre Tekrarı"
                          size="sm"
                          withAsterisk
                        />
                      )}
                    />

                    <Controller
                      name="termsAndPrivacyPolicy"
                      control={registerControl}
                      render={({
                        field: { onChange, ...field },
                        fieldState,
                      }) => (
                        <div className="space-y-1">
                          <Switch
                            checked={field.value}
                            onChange={(event) =>
                              onChange(event.currentTarget.checked)
                            }
                            error={fieldState.error?.message}
                            className="w-fit"
                            label={
                              <Text component="span" size="sm">
                                <Link
                                  href="/kullanici-sozlesmesi"
                                  className="text-blue-600 hover:underline"
                                  target="_blank"
                                >
                                  Kullanıcı sözleşmesini
                                </Link>{" "}
                                ve{" "}
                                <Link
                                  href="/kvkk"
                                  className="text-blue-600 hover:underline"
                                  target="_blank"
                                >
                                  KVKK metnini
                                </Link>{" "}
                                okudum ve kabul ediyorum
                              </Text>
                            }
                          />
                        </div>
                      )}
                    />

                    {RegisterErrors.root && (
                      <p className="text-sm text-red-500">
                        {RegisterErrors.root.message}
                      </p>
                    )}

                    <Button fullWidth size="sm" type="submit">
                      Kayıt Ol
                    </Button>
                  </form>
                </Tabs.Panel>
              </>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
