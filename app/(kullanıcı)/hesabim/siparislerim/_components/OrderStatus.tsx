import React from "react";
import { FiClock, FiCheck, FiXCircle } from "react-icons/fi";
import { BiPackage } from "react-icons/bi";
import { FaTruck } from "react-icons/fa";
import { Badge, Group, Text } from "@mantine/core";
import CustomImage from "@/components/CustomImage";

const OrderStatusDisplay = ({ status, deliveredAt }) => {
  const getStatusConfig = (status) => {
    const configs = {
      PENDING: {
        icon: <FiClock size={14} />,
        color: "yellow",
        text: "Beklemede",
      },
      PROCESSING: {
        icon: <BiPackage size={14} />,
        color: "blue",
        text: "Hazırlanıyor",
      },
      SHIPPED: {
        icon: <FaTruck size={14} />,
        color: "indigo",
        text: "Kargoya Verildi",
      },
      DELIVERED: {
        icon: <FiCheck size={14} />,
        color: "green",
        text: "Teslim Edildi",
      },
      CANCELLED: {
        icon: <FiXCircle size={14} />,
        color: "red",
        text: "İptal Edildi",
      },
    };

    return configs[status] || { icon: null, color: "gray", text: status };
  };

  const statusConfig = getStatusConfig(status);

  return (
    <Group gap="md">
      <Badge
        size="lg"
        variant="light"
        color={statusConfig.color}
        leftSection={statusConfig.icon}
      >
        {statusConfig.text}
      </Badge>

      {status === "DELIVERED" && deliveredAt && (
        <Text size="sm" c="dimmed">
          Teslim Tarihi: {new Date(deliveredAt).toLocaleDateString("tr-TR")}
        </Text>
      )}
    </Group>
  );
};

export default OrderStatusDisplay;
