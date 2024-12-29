import ReBuyButton from "@/app/(kullanici)/hesabim/siparislerim/_components/ReBuyButton";
import CustomImage from "@/components/CustomImage";
import { formattedPrice } from "@/lib/format";
import { Card, ColorSwatch, Group, Stack, Text, Title } from "@mantine/core";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { TbRuler, TbWeight } from "react-icons/tb";
import { OrderItemsForRefund } from "../page";
import OrderItemsRefund from "./OrderItemsRefund";
type OrderItemsForRefundExtended = OrderItemsForRefund & {
  isSameDay: boolean;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  isCancelled: boolean;
  paymentId: string;
};

const OrderItemsCard = (props: OrderItemsForRefundExtended) => {
  const renderVariantValue = () => {
    switch (props.variant.type) {
      case "COLOR":
        return <ColorSwatch size={16} color={props.variant.value} />;
      case "SIZE":
        return (
          <Group gap="xs">
            <TbRuler size={14} color="#666666" />
            <Text size="sm" c="dimmed">
              {props.variant.value}
            </Text>
          </Group>
        );
      case "WEIGHT":
        return (
          <Group gap="xs">
            <TbWeight size={14} color="#666666" />
            <Text size="sm" c="dimmed">
              {props.variant.value} {props.variant.unit}
            </Text>
          </Group>
        );
    }
  };

  return (
    <Card withBorder padding="sm" shadow="sm" radius="sm">
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="relative w-full lg:w-32">
          <div className="aspect-square lg:aspect-auto lg:h-full">
            <CustomImage
              src={props.variant.Image[0].url}
              alt={props.variant.product.name}
              objectFit="cover"
              className="rounded-lg"
              quality={80}
            />
          </div>
        </div>

        <Stack gap="xs" className="flex-1">
          <div className="flex w-full flex-row justify-between">
            <Title order={5} lineClamp={1}>
              {props.variant.product.name} {renderVariantValue()}
            </Title>
            {!props.isCancelled &&
              props.orderStatus === "COMPLETED" &&
              props.paymentStatus === "SUCCESS" &&
              !props.isSameDay &&
              !props.isRefunded &&
              props.refundStatus === "NONE" && (
                <OrderItemsRefund
                  orderItemId={props.id}
                  paymentId={props.paymentId}
                  quantity={props.quantity}
                />
              )}
            {props.refundStatus === "REJECTED" && (
              <Text size="sm" c="red">
                İade işlemi reddedildi
              </Text>
            )}
            {props.refundStatus === "REQUESTED" && (
              <Text size="sm" c="red">
                İade işlemi talep edildi
              </Text>
            )}
            {props.refundStatus === "COMPLETED" && (
              <Text size="sm" c="green">
                İade işlemi tamamlandı
              </Text>
            )}
          </div>
          <Group gap="xs">
            <Text size="md" fw={500}>
              {formattedPrice(props.price)}
            </Text>
            <Text size="md" c="dimmed">
              x {props.quantity}
            </Text>
          </Group>

          <Text size="md" c="dimmed" lineClamp={2}>
            {props.variant.product.description}
          </Text>
          {!props.variant.softDelete && <ReBuyButton variant={props.variant} />}
        </Stack>
      </div>
    </Card>
  );
};

export default OrderItemsCard;
