import { OrderStatus } from "@prisma/client";

export const OrderFormat = (status: OrderStatus) => {
  if (status === "CANCELLED") {
    return "İptal Edildi";
  }
  if (status === "DELIVERED") {
    return "Teslim Edildi";
  }
  if (status === "SHIPPED") {
    return "Kargoya verildi";
  }
  if (status === "PROCESSING") {
    return "Hazırlanıyor";
  }
  if (status === "PENDING") {
    return "Onay Bekliyor";
  }
  return null;
};
