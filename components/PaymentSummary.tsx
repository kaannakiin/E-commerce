import { formattedPrice } from "@/lib/format";
import { Paper, Stack, Group, Text, Divider } from "@mantine/core";

const PaymentSummary = ({ items, className }) => {
  // Hesaplamalar
  const subtotal = items.reduce(
    (acc, item) => acc + item.price * (1 - item.discount / 100) * item.quantity,
    0,
  );
  const shipping = 0; // Kargo ücreti varsa buraya eklenebilir
  const total = subtotal + shipping;

  return (
    <Paper
      className={`${className} bg-transparent transition-all duration-200`}
    >
      <Stack gap="xs">
        <Text size="sm" fw={600} c="dimmed">
          ÖDEME ÖZETİ
        </Text>

        <Group justify="space-between" my={4}>
          <Text size="sm" c="dimmed">
            Ara Toplam
          </Text>
          <Text size="sm">{formattedPrice(subtotal)}</Text>
        </Group>

        <Group justify="space-between" my={4}>
          <Text size="sm" c="dimmed">
            Kargo
          </Text>
          <Text size="sm" c="dimmed">
            Ücretsiz
          </Text>
        </Group>

        {/* İndirim varsa göster */}
        {items.some((item) => item.discount > 0) && (
          <Group justify="space-between" my={4}>
            <Text size="sm" c="green">
              Toplam İndirim
            </Text>
            <Text size="sm" c="green">
              {formattedPrice(
                items.reduce(
                  (acc, item) =>
                    acc + (item.price * item.quantity * item.discount) / 100,
                  0,
                ),
              )}
            </Text>
          </Group>
        )}

        <Divider my={8} />

        <Group justify="space-between">
          <Text fw={700}>Toplam</Text>
          <Text size="xl" fw={700}>
            {formattedPrice(total)}
          </Text>
        </Group>

        <Text size="xs" c="dimmed" ta="center" mt={8}>
          KDV Dahil
        </Text>
      </Stack>
    </Paper>
  );
};

export default PaymentSummary;
