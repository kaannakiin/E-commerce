import { Avatar, Group, Text } from "@mantine/core";
interface userInfoProps {
  name: string;
  email: string;
}
const userInfo = async ({ email, name }: userInfoProps) => {
  return (
    <Group gap="md">
      <Avatar
        color="primary"
        radius="xl"
        styles={{
          root: { backgroundColor: "white" },
        }}
      >
        A
      </Avatar>
      <div>
        <Text size="sm" fw={500}>
          {name}
        </Text>
        <Text size="xs" c="dimmed">
          {email}
        </Text>
      </div>
    </Group>
  );
};

export default userInfo;
