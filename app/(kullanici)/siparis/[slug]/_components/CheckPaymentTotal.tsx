import React from "react";
import { Card, Stack, Title, Divider } from "@mantine/core";
const CheckPaymentTotal = () => {
  return (
    <Card withBorder shadow="md" padding="lg">
      <Stack gap={"xs"}>
        <Title order={4}>Sepet Tutarı</Title>
        <Divider />
      </Stack>
    </Card>
  );
};

export default CheckPaymentTotal;
