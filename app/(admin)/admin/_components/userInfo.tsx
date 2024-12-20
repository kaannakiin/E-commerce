import { Avatar, Group, Text } from "@mantine/core";
import { useSession } from "next-auth/react";

export function UserInfo() {
  const { data: session } = useSession();

  return (
    <Group gap="md">
      <Avatar
        color="primary"
        radius="xl"
        styles={{
          root: { backgroundColor: "white" },
        }}
      >
        {session?.user?.name?.[0] ?? "A"}
      </Avatar>
      <div>
        <Text size="sm" fw={500}>
          {session?.user?.name ?? "Admin User"}
        </Text>
        <Text size="xs" c="dimmed">
          {session?.user?.email ?? "admin@example.com"}
        </Text>
      </div>
    </Group>
  );
}
