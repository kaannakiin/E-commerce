"use client";
import {
  BankTransferFormValues,
  BankTransferSchema,
} from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionIcon,
  Button,
  CopyButton,
  Grid,
  Stack,
  Text,
  TextInput,
  Tooltip,
  rem,
} from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { FaCheck } from "react-icons/fa6";
import { IoCopyOutline } from "react-icons/io5";
import { createBankTransferNotification } from "../_actions/BankTransfer";
import MainLoader from "@/components/MainLoader";
import { useRouter } from "next/navigation";

const BankTransferNotificationForm = ({
  orderNumber,
}: {
  orderNumber: string;
}) => {
  const {
    control,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BankTransferFormValues>({
    resolver: zodResolver(BankTransferSchema),
    defaultValues: {
      transferFirstName: "",
      transferLastName: "",
      transferTime: "",
    },
  });
  const { push } = useRouter();
  const onSubmit: SubmitHandler<BankTransferFormValues> = async (data) => {
    try {
      await createBankTransferNotification(data, orderNumber).then((res) => {
        if (res.success) {
          push(`/siparis/${orderNumber}`);
        } else {
          setError("root", { message: res.message });
        }
      });
    } catch (error) {}
  };
  if (isSubmitting) return <MainLoader />;
  return (
    <Stack gap="md">
      <Stack gap="xs">
        <Text size="lg" fw={500}>
          Havale / EFT Bildirim Formu
        </Text>
        <Text size="sm" c="dimmed">
          Lütfen yapmış olduğunuz havale/EFT işleminin bilgilerini aşağıdaki
          forma giriniz. İşleminiz onaylandıktan sonra siparişiniz hazırlanmaya
          başlanacaktır.
        </Text>
        <Text size="sm">Önemli Notlar:</Text>
        <ul className="list-disc pl-4 text-sm text-gray-600">
          <li className="font-bold">
            Lütfen açıklamaya sipariş numaranızı yazınız.
          </li>

          <li>İşlem saatini banka dekontunuzdan kontrol ederek giriniz</li>
          <li>Havale yapan kişinin adı ve soyadını tam olarak yazınız</li>
          <li>Bildiriminiz en geç 24 saat içinde kontrol edilecektir</li>
        </ul>
        <span className="flex items-center gap-1">
          <Text>Sipariş numarası: {orderNumber}</Text>
          <CopyButton value={orderNumber} timeout={2000}>
            {({ copied, copy }) => (
              <Tooltip
                label={copied ? "Kopyalandı" : "Kopyala"}
                withArrow
                position="right"
              >
                <ActionIcon
                  color={copied ? "teal" : "gray"}
                  variant="light"
                  onClick={copy}
                >
                  {copied ? (
                    <FaCheck style={{ width: rem(16) }} />
                  ) : (
                    <IoCopyOutline style={{ width: rem(16) }} />
                  )}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        </span>
      </Stack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid>
          <Grid.Col span={6}>
            <Controller
              control={control}
              name="transferFirstName"
              render={({ field }) => (
                <TextInput
                  {...field}
                  label="İsim"
                  error={errors.transferFirstName?.message}
                />
              )}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Controller
              control={control}
              name="transferLastName"
              render={({ field }) => (
                <TextInput
                  {...field}
                  label="Soyisim"
                  error={errors.transferLastName?.message}
                />
              )}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Controller
              control={control}
              name="transferTime"
              render={({ field }) => (
                <TimeInput
                  {...field}
                  label="İşlem saati"
                  error={errors.transferTime?.message}
                />
              )}
            />
          </Grid.Col>
          <Grid.Col span={6} className="mt-auto">
            <Button type="submit" fullWidth>
              Gönder
            </Button>
          </Grid.Col>
          <Grid.Col span={12}>
            <Text c="red">{errors.root?.message}</Text>
          </Grid.Col>
        </Grid>
      </form>
    </Stack>
  );
};

export default BankTransferNotificationForm;
