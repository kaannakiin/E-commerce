"use client";
import { formatPrice } from "@/lib/formatter";
import { useStore } from "@/store/store";
import { discountCode, DiscountCodeType } from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Accordion,
  Button,
  ColorSwatch,
  Indicator,
  Paper,
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { DiscountCheck as DiscountCheckforShopping } from "@/actions/user/discount-check";
import { useMediaQuery } from "@mantine/hooks";
import { VariantType } from "@prisma/client";
import { Fragment, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import CustomImage from "./CustomImage";
import UnAuthForm from "./UnAuthForm";
import PaymentSummary from "./PaymentSummary";

const UnauthCheckout = () => {
  const items = useStore((state) => state.items);
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.lg})`);
  const totalPrice = items.reduce(
    (acc, item) => acc + item.price * (1 - item.discount / 100) * item.quantity,
    0,
  );
  const [discountMessage, setDiscountMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DiscountCodeType>({
    resolver: zodResolver(discountCode),
  });
  const onSubmitDiscount: SubmitHandler<DiscountCodeType> = async (data) => {
    await DiscountCheckforShopping(
      data.code,
      items.map((item) => item.variantId),
    ).then((res) => {
      if (!res.success) {
        setError("code", { message: res.message });
        setDiscountMessage(null);
      }
      if (res.success) {
        setDiscountMessage(res.message);
      }
    });
  };

  const DiscountCheck = () => (
    <Paper className="mb-2 bg-transparent lg:mx-4">
      <PaymentSummary
        items={items}
        className={isMobile ? "mx-4 mb-4" : "mx-4"}
      />
      <Text size="xs" fw={500} c="dimmed" mb={8}>
        KUPON KODU
      </Text>
      <form className="flex gap-2" onSubmit={handleSubmit(onSubmitDiscount)}>
        <TextInput
          placeholder="Kodunuzu buraya girin"
          {...register("code")}
          className="flex-1"
          onChange={(e) => {
            e.currentTarget.value = e.currentTarget.value.toUpperCase();
          }}
          onPaste={(e) => {
            e.clipboardData.setData(
              "text/plain",
              e.clipboardData.getData("text/plain").toUpperCase(),
            );
          }}
          variant="filled"
          size="sm"
          error={errors.code?.message}
          styles={(theme) => ({
            input: {
              "&:focus": {
                borderColor: theme.colors.gray[5],
              },
            },
          })}
        />
        <Button
          variant="light"
          size="sm"
          type="submit"
          loading={isSubmitting}
          styles={(theme) => ({
            root: {
              backgroundColor: theme.white,
              border: `1px solid ${theme.colors.gray[3]}`,
              color: theme.colors.gray[7],
              "&:hover": {
                backgroundColor: theme.colors.gray[0],
              },
            },
          })}
        >
          Uygula
        </Button>
      </form>
      {discountMessage && (
        <p className="text-sm text-green-500">{discountMessage}</p>
      )}
    </Paper>
  );

  const ItemsContent = () => (
    <>
      {items.map((item) => (
        <div
          key={item.variantId}
          className="mb-2 flex w-full flex-row gap-4 py-3"
        >
          <Indicator
            label={item.quantity}
            size={18}
            color="gray"
            className="relative h-20 w-20"
          >
            <CustomImage src={item.imageUrl} quality={21} />
          </Indicator>
          <div className="flex flex-1 flex-col justify-between">
            <div className="flex flex-row justify-between">
              <div>
                <h1 className="font-thin uppercase">{item.name}</h1>
                {item.type === VariantType.COLOR && (
                  <ColorSwatch color={item.value} size={16} />
                )}
                {item.type === VariantType.SIZE && (
                  <span className="text-sm text-gray-500">{item.value}</span>
                )}
                {item.type === VariantType.WEIGHT && (
                  <span className="text-sm text-gray-500">
                    {item.value} {item.unit}
                  </span>
                )}
                <p className="text-xs">Adet: {item.quantity}</p>
              </div>
              <p className="my-auto font-thin">
                {formatPrice(item.price * (1 - item.discount / 100))}
              </p>
            </div>
            <p className="text-xs text-gray-600">{item.description}</p>
          </div>
        </div>
      ))}
    </>
  );

  const MobileAccordion = () => (
    <Accordion
      defaultValue="siparisozeti"
      classNames={{
        item: "border-none",
        control: "bg-gray-100 hover:bg-gray-200 transition-all duration-200",
        panel: "bg-gray-50",
        chevron: "transition-transform duration-200",
      }}
    >
      <Accordion.Item value="siparisozeti">
        <Accordion.Control>
          <div className="flex items-center justify-between pr-4">
            <Text size="sm" fw={500}>
              Sipariş Özeti ({items.length} Ürün)
            </Text>
            <Text size="sm" fw={600}>
              {formatPrice(totalPrice)}
            </Text>
          </div>
        </Accordion.Control>
        <Accordion.Panel>
          <div className="p-2">
            <ItemsContent />
            <DiscountCheck />
          </div>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );

  return (
    <div className="flex w-full flex-col lg:flex-row">
      {isMobile ? (
        <Fragment>
          <div className="w-full bg-white shadow-sm">
            <MobileAccordion />
          </div>
          <div className="w-full px-4">
            <UnAuthForm />
          </div>
        </Fragment>
      ) : (
        <Fragment>
          <div className="w-full lg:w-1/2">
            <UnAuthForm />
          </div>
          <div className="flex min-h-screen w-full flex-col border-l-2 border-gray-200 bg-gray-200 p-4 lg:w-1/2">
            <div className="mb-4 flex items-center justify-between">
              <Text size="lg" fw={500}>
                Sipariş Özeti ({items.length} Ürün)
              </Text>
              <Text size="lg" fw={600}>
                {formatPrice(totalPrice)}
              </Text>
            </div>
            <ItemsContent />
            <DiscountCheck />
          </div>
        </Fragment>
      )}
    </div>
  );
};

export default UnauthCheckout;
