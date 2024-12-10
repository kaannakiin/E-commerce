"use client";
import { refundAdminSchema, RefundAdminValues } from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Divider,
  Group,
  NumberInput,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { BiPackage } from "react-icons/bi";
import { FiAlertCircle } from "react-icons/fi";
import { GiCoins } from "react-icons/gi";
import { ReturnAdminOrder } from "../_actions/RefundAdminAction";
const RefundModalForm = ({
  item,
  maxQuantity,
  description,
  price,
  reason,
}: {
  item: string;
  maxQuantity: number;
  description: string;
  price: number;
  reason: string;
}) => {
  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RefundAdminValues>({
    resolver: zodResolver(refundAdminSchema),
    defaultValues: {
      quantity: 1,
      orderId: item,
    },
  });

  const onSubmit: SubmitHandler<RefundAdminValues> = async (data) => {
    await ReturnAdminOrder(data).then((res) => {
      if (!res.status) {
        setError("root", { message: res.message });
      }
    });
  };

  const selectedQuantity = watch("quantity") || 1;
  const totalRefundAmount = price * selectedQuantity;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="lg">
        <div>
          <Box className="rounded-lg bg-yellow-50/80 p-4">
            <Text fw={500} size="sm" mb="xs">
              İade Talebi Nedeni
            </Text>
            <div className="rounded-md bg-white/80 p-3">
              <Text size="sm" className="text-gray-600">
                {description} - {reason}
              </Text>
            </div>
          </Box>
          <Group mb="xs">
            <BiPackage size={20} className="text-gray-600" />
            <Text fw={500} size="sm">
              İade Miktarı
            </Text>
          </Group>
          <Controller
            name="quantity"
            control={control}
            render={({ field }) => (
              <NumberInput
                {...field}
                value={field.value}
                onChange={(val) => field.onChange(val)}
                min={1}
                max={maxQuantity}
                size="md"
                error={errors.quantity?.message}
                description={`Maksimum ${maxQuantity} adet iade edilebilir`}
                hideControls={false}
                clampBehavior="strict"
              />
            )}
          />
        </div>

        <div>
          <Group mb="xs">
            <Text fw={500} size="sm">
              İade Tutarı
            </Text>
          </Group>
          <NumberInput
            disabled
            value={totalRefundAmount}
            decimalScale={2}
            size="md"
            prefix="₺"
            hideControls
            styles={{
              input: {
                backgroundColor: "var(--mantine-color-blue-0)",
                fontWeight: 500,
                color: "black",
              },
            }}
          />
        </div>
        <div>
          <Group mb="xs">
            <Text fw={500} size="sm">
              Admin Açıklaması{" "}
            </Text>
          </Group>
          <Controller
            name="adminNote"
            control={control}
            render={({ field }) => (
              <Textarea
                description="Bu açıklama kullanıcıya gösterilecektir"
                {...field}
                onChange={(val) => field.onChange(val)}
                maxRows={3}
              />
            )}
          />
        </div>
        {errors.root && (
          <Text color="red" size="sm">
            {errors.root.message}
          </Text>
        )}
        <Divider />

        <div className="rounded-lg bg-yellow-50 p-3">
          <Group>
            <FiAlertCircle size={20} className="text-yellow-600" />
            <Text size="sm" c="dimmed">
              Bu işlem geri alınamaz. İade onaylandıktan sonra iptal edilemez.
            </Text>
          </Group>
        </div>

        <Group justify="flex-end">
          <Button
            type="submit"
            loading={isSubmitting}
            leftSection={<BiPackage size={16} />}
            color="blue"
          >
            İade Talebini Onayla
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default RefundModalForm;
