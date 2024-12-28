"use client";
import CustomImage from "@/components/CustomImage";
import {
  formatPaymentStatusWithColor,
  formattedPrice,
  getOrderStatusConfig,
} from "@/lib/format";
import {
  Badge,
  Card,
  Container,
  Grid,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Order } from "../[slug]/page";
import RefundRequestModal from "./RefundOrderItems";

const OrderDetailsPage = ({ order }: { order: Order }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const OrderSummaryCard = () => (
    <Card withBorder shadow="sm" radius="md" p="md">
      <div className="mb-4 flex w-full flex-row items-center justify-between">
        <Text fw={600} size="lg">
          Sipariş Özeti
        </Text>
        <Badge color={getOrderStatusConfig(order.status).color} size="lg">
          {getOrderStatusConfig(order.status).text}
        </Badge>
      </div>

      <Stack gap="xs">
        <Group justify="space-between">
          <Text size="sm">Ödenen Tutar:</Text>
          <Text size="sm">{formattedPrice(order.total)}</Text>
        </Group>
        <Group justify="space-between">
          <Text size="sm">Kart:</Text>
          <Text size="sm">{order.maskedCardNumber}</Text>
        </Group>
        <Group justify="space-between">
          <Text size="sm">Kazandığınız Tutar:</Text>
          <Text size="sm">{formattedPrice(order.priceIyzico)}</Text>
        </Group>
        <Group justify="space-between">
          <Text size="sm">Kargo</Text>
          <Text size="sm">
            {/* TODO */}
            {order.total - order.priceIyzico > 0
              ? formattedPrice(order.total - order.priceIyzico)
              : "Ücretsiz"}
          </Text>
        </Group>
        {order.discountCode && (
          <Group justify="space-between">
            <Text size="sm">İndirim Kuponu: {order.discountCode.code} </Text>
            <Text size="sm">
              {/* TODO */}
              {order.total - order.priceIyzico > 0
                ? formattedPrice(order.total - order.priceIyzico)
                : "Ücretsiz"}
            </Text>
          </Group>
        )}
      </Stack>
    </Card>
  );

  // Customer Details Card
  const CustomerDetailsCard = () => (
    <Card withBorder shadow="sm" radius="md" p="md">
      <Text fw={600} size="lg" mb="xs">
        Siparişi Veren
      </Text>
      {order.user && (
        <div>
          <Text fw={500}>
            {order.user.name.charAt(0).toLocaleUpperCase() +
              order.user.name.slice(1)}
            {order.user.surname.charAt(0).toLocaleUpperCase() +
              order.user.surname.slice(1)}
          </Text>
          <Text size="sm" c="dimmed">
            {order.user.email}
          </Text>
          <Text size="sm" c="dimmed">
            {order.user.phone}
          </Text>
        </div>
      )}
      {!order.user && (
        <Stack gap="xs">
          <div>
            <Text fw={500}>
              {order.address.name.charAt(0).toLocaleUpperCase() +
                order.address.name.slice(1)}
              {order.address.surname.charAt(0).toLocaleUpperCase() +
                order.address.surname.slice(1)}
            </Text>
            <Text size="sm" c="dimmed">
              {order.address.email}
            </Text>
            <Text size="sm" c="dimmed">
              {order.address.phone}
            </Text>
          </div>
        </Stack>
      )}
    </Card>
  );

  const ShippingAddressCard = () => (
    <Card withBorder shadow="sm" radius="md" p="md">
      <Text fw={600} size="lg" mb="xs">
        Kargo Adresi
      </Text>
      <Text size="sm">
        {order.address.name.charAt(0).toLocaleUpperCase() +
          order.address.name.slice(1)}
        {order.address.surname.charAt(0).toLocaleUpperCase() +
          order.address.surname.slice(1)}
      </Text>
      <Text size="sm">{order.address.phone}</Text>
      <Text size="sm">{order.address.email}</Text>
      <Text size="sm">
        {order.address.city} / {order.address.district}
      </Text>
      <Text size="sm">
        {order.address.addressDetail.charAt(0).toLocaleUpperCase() +
          order.address.addressDetail.slice(1)}
      </Text>
    </Card>
  );

  // Order Items List
  const OrderItemsList = () => (
    <ScrollArea h={isMobile ? 400 : 600}>
      <Stack gap="md">
        {order.OrderItems.map((item) => (
          <Paper key={item.id} withBorder p="md" radius="md">
            <Group wrap="nowrap">
              <div className="relative h-24 w-24">
                {item.variant.Image && (
                  <CustomImage
                    src={item.variant.Image[0].url}
                    objectFit="contain"
                    alt="Product Image"
                  />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <Text fw={500}>{item.variant.product.name}</Text>
                <Group justify="space-between" mt="xs">
                  <Text size="sm" c="dimmed">
                    Adet: {item.quantity}
                  </Text>
                </Group>
                <Text fw={500} mt="xs">
                  {formattedPrice(item.price)}
                </Text>
              </div>
              <div>
                {item.refundStatus === "PROCESSING" && (
                  <RefundRequestModal item={item} paymentId={order.paymentId} />
                )}
                {item.refundStatus === "COMPLETED" && (
                  <Badge color="red" size="md">
                    İade Edildi
                  </Badge>
                )}
              </div>
            </Group>
          </Paper>
        ))}
      </Stack>
    </ScrollArea>
  );

  return (
    <Container size="xl" py="xl">
      <div className="flex w-full flex-row items-center justify-between">
        <Text fw={700} size="xl" mb="lg">
          Sipariş {order.orderNumber}
        </Text>
        <Badge
          size="xl"
          color={formatPaymentStatusWithColor(order.paymentStatus).color}
        >
          {formatPaymentStatusWithColor(order.paymentStatus).text}
        </Badge>
      </div>

      <Grid gutter="md">
        {/* Main content area */}
        <Grid.Col span={isMobile ? 12 : 8}>
          <Card withBorder shadow="sm" radius="md" p="md">
            <Text fw={600} size="lg" mb="md">
              Siparişler
            </Text>
            <OrderItemsList />
          </Card>
        </Grid.Col>

        {/* Side cards */}
        <Grid.Col span={isMobile ? 12 : 4}>
          <Stack gap="md">
            <OrderSummaryCard />
            <CustomerDetailsCard />
            <ShippingAddressCard />
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default OrderDetailsPage;
