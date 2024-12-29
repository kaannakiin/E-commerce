import { Card, Divider, Group, Stack, Text, Title } from "@mantine/core";
import { HiEnvelope, HiMapPin, HiPhone, HiUser } from "react-icons/hi2";

interface UserInfoCardProps {
  name: string;
  surname: string;
  email: string;
  phone: string;
  city: string;
  distirct: string;
  addressDetail: string;
  addressTitle: string | null;
}

const UserInfoCard = ({
  addressDetail,
  addressTitle,
  city,
  distirct,
  email,
  name,
  phone,
  surname,
}: UserInfoCardProps) => {
  return (
    <Card withBorder shadow="md" padding="lg">
      <Stack gap="xs">
        <Title order={4}>Teslimat Adresi</Title>
        <Divider />
        <Group gap="xs">
          <HiUser color="gray" size={18} />
          <Text fw={500}>
            {firstWordUppercase(name)} {firstWordUppercase(surname)}
          </Text>
        </Group>
        <Group gap="xs">
          <HiPhone color="gray" size={18} />
          <Text>{phone}</Text>
        </Group>
        <Group gap="xs">
          <HiEnvelope color="gray" size={18} />
          <Text>{email}</Text>
        </Group>
        <Group gap="xs" align="flex-start">
          <HiMapPin color="gray" size={18} />
          <Stack gap={4}>
            {addressTitle && (
              <Text fw={500}>{firstWordUppercase(addressTitle)}</Text>
            )}
            <Text>{addressDetail}</Text>
            <Text c="dimmed">
              {firstWordUppercase(distirct)} / {firstWordUppercase(city)}
            </Text>
          </Stack>
        </Group>
      </Stack>
    </Card>
  );
};

export default UserInfoCard;

function firstWordUppercase(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
