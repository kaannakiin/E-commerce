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
  Paper,
  PasswordInput,
  Tabs,
  Text,
  TextInput,
} from "@mantine/core";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import { IMaskInput } from "react-imask";
import classes from "./modules/LoginPage.module.css";
import { useSearchParams } from "next/navigation";
export function AuthenticationImage() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";

  const {
    register: LoginRegister,
    handleSubmit: LoginHandleSubmit,
    setError: LoginSetError,
    formState: { errors: LoginErrors, isSubmitting: LoginIsSubmitting },
  } = useForm<LoginSchemaType>({ resolver: zodResolver(LoginSchema) });
  const {
    register: RegisterRegister,
    handleSubmit: RegisterHandleSubmit,
    setError: RegisterSetError,
    setValue,
    formState: { errors: RegisterErrors, isSubmitting: RegisterIsSubmitting },
  } = useForm<RegisterSchemaType>({ resolver: zodResolver(RegisterSchema) });

  const onSubmitLogin: SubmitHandler<LoginSchemaType> = async (data) => {
    await Login(data, callbackUrl).then((res) => {
      if (res.success) {
        LoginSetError("email", {
          message: "Başarıyla giriş yaptınız. Yönlendiriliyorsunuz.",
        });
      }
      LoginSetError("root", { message: res.error });
    });
  };
  const onSubmitRegister: SubmitHandler<RegisterSchemaType> = async (data) => {
    await Register(data).then(async (res) => {
      if (res.success) {
        await Login(
          { email: data.email, password: data.password },
          callbackUrl
        );
      }
      if (res.error) {
        console.log(res);
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
    <div className={classes.wrapper}>
      <Paper className={classes.form} radius={0} p={30}>
        <Tabs defaultValue="giris">
          <Tabs.List grow>
            <Tabs.Tab value="giris">Giriş Yap</Tabs.Tab>
            <Tabs.Tab value="kayit">Kayıt Ol</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="giris" className="mt-4">
            <form onSubmit={LoginHandleSubmit(onSubmitLogin)}>
              <TextInput
                {...LoginRegister("email")}
                error={LoginErrors.email?.message}
                label="Email"
                size="sm"
                withAsterisk
              />
              <PasswordInput
                {...LoginRegister("password")}
                error={LoginErrors.password?.message}
                label="Şifre"
                mt="md"
                size="sm"
                withAsterisk
              />
              {LoginErrors.email && (
                <p className=" text-sm text-green-500 mt-1">
                  {LoginErrors.email.message}
                </p>
              )}
              {LoginErrors.root && (
                <p className="text-red-500 text-sm mt-1">
                  {LoginErrors.root.message}
                </p>
              )}
              <div className="cursor-pointer underline text-sm mt-1 text-end ">
                <Text component={Link} href={"/sifremi-unuttum"}>
                  Şifremi unuttum
                </Text>
              </div>

              <Button
                fullWidth
                mt="md"
                size="sm"
                type="submit"
                loading={LoginIsSubmitting}
              >
                Giriş Yap
              </Button>
            </form>
          </Tabs.Panel>
          <Tabs.Panel value="kayit" className="mt-4">
            <form onSubmit={RegisterHandleSubmit(onSubmitRegister)}>
              <TextInput
                label="Email"
                {...RegisterRegister("email")}
                error={RegisterErrors.email?.message}
                size="sm"
                withAsterisk
              />
              <TextInput
                label="Adınız"
                {...RegisterRegister("name")}
                error={RegisterErrors.name?.message}
                mt="md"
                size="sm"
                withAsterisk
              />
              <TextInput
                label="Soyadınız"
                {...RegisterRegister("surname")}
                error={RegisterErrors.surname?.message}
                mt="md"
                size="sm"
                withAsterisk
              />
              <InputBase
                component={IMaskInput}
                {...RegisterRegister("phone")}
                error={RegisterErrors.phone?.message}
                onChange={(e) => {
                  setValue("phone", e.currentTarget.value);
                }}
                mask={"(000) 000 00 00"}
                mt="md"
                size="sm"
                label="Telefon Numarası"
              />
              <PasswordInput
                label="Şifre"
                {...RegisterRegister("password")}
                error={RegisterErrors.password?.message}
                mt="md"
                size="sm"
                withAsterisk
              />
              <PasswordInput
                label="Şifre Tekrarı"
                {...RegisterRegister("confirmPassword")}
                error={RegisterErrors.confirmPassword?.message}
                mt="md"
                size="sm"
                withAsterisk
              />
              {RegisterErrors.root && (
                <p className="text-red-500 mt-1 text-sm">
                  {RegisterErrors.root.message}
                </p>
              )}
              <Button
                fullWidth
                mt="md"
                size="sm"
                type="submit"
                loading={RegisterIsSubmitting}
              >
                Kayıt Ol{" "}
              </Button>
            </form>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </div>
  );
}
// TODO EMAİL DOĞRULAMASI GÖNDERİLMELİ
