import CustomImage from "@/components/CustomImage";
import { VariantData } from "@/zodschemas/authschema";
import {
  ActionIcon,
  AspectRatio,
  Badge,
  Card,
  ColorSwatch,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import { Fragment } from "react";
import { FaPencilAlt } from "react-icons/fa";
import { IoColorPalette, IoResize, IoScale, IoTrash } from "react-icons/io5";

interface VariantListProps {
  variants: VariantData[];
  onDeleteVariant?: (id: string) => void;
  onEditVariant?: (variant: VariantData) => void;
}

const getVariantIcon = (type: string) => {
  switch (type) {
    case "COLOR":
      return <IoColorPalette size={20} className="text-blue-500" />;
    case "SIZE":
      return <IoResize size={20} className="text-green-500" />;
    case "WEIGHT":
      return <IoScale size={20} className="text-purple-500" />;
    default:
      return <IoColorPalette size={20} className="text-gray-500" />;
  }
};

export function VariantList({
  variants,
  onDeleteVariant,
  onEditVariant,
}: VariantListProps) {
  if (!variants || variants.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        Henüz bir varyant eklenmemiş.
      </Text>
    );
  }

  return (
    <div className="space-y-4">
      {variants.map((variant) => (
        <Card key={variant.uniqueId} withBorder padding="md">
          <Group wrap="nowrap" justify="space-between">
            <Stack gap="xs" style={{ flex: 1 }}>
              <Group gap="md">
                {getVariantIcon(variant.type)}
                {variant.type === "COLOR" ? (
                  <Group gap="xs">
                    <ColorSwatch color={variant.value.toString()} size={22} />
                    <Text fw={500} size="sm">
                      {variant.value.toString().toUpperCase()}
                    </Text>
                  </Group>
                ) : (
                  <Text fw={500}>
                    {variant.value}
                    {variant.unit && ` ${variant.unit}`}
                  </Text>
                )}
              </Group>

              <Group gap="lg">
                <Text size="sm" c="dimmed">
                  Stok:{" "}
                  <Text
                    span
                    fw={500}
                    color={variant.stock < 20 ? "red" : undefined}
                  >
                    {variant.stock}
                  </Text>
                </Text>

                <Group gap="xs">
                  {variant.discount ? (
                    <Fragment>
                      <Text size="sm" c="dimmed" td="line-through">
                        {variant.price} TL
                      </Text>
                      <Text fw={600} size="lg" c="red">
                        {variant.price -
                          (variant.price * variant.discount) / 100}{" "}
                        TL
                      </Text>
                      <Badge color="red" variant="light" size="sm">
                        %{variant.discount}
                      </Badge>
                    </Fragment>
                  ) : (
                    <Text fw={600} size="lg">
                      {variant.price} TL
                    </Text>
                  )}
                </Group>
              </Group>

              {!variant.active && (
                <Badge color="red" variant="dot" size="sm">
                  Pasif
                </Badge>
              )}
            </Stack>

            {/* Aksiyon butonları */}
            <Group gap="sm">
              <ActionIcon
                variant="light"
                color="blue"
                onClick={() => onEditVariant?.(variant)}
                size="lg"
              >
                <FaPencilAlt size={18} />
              </ActionIcon>
              <ActionIcon
                variant="light"
                color="red"
                onClick={() => onDeleteVariant?.(variant.uniqueId)}
                size="lg"
              >
                <IoTrash size={18} />
              </ActionIcon>
            </Group>
          </Group>
        </Card>
      ))}
    </div>
  );
}
