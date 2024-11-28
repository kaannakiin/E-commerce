import { OrderStatus } from "@prisma/client";

interface StatusConfig {
  text: string;
  color: string;
}

export const getOrderStatusConfig = (status: OrderStatus): StatusConfig => {
  switch (status) {
    case OrderStatus.AWAITING_APPROVAL:
      return { text: "Onay Bekliyor", color: "#FFA500" }; // Turuncu
    case OrderStatus.PENDING:
      return { text: "Beklemede", color: "#FFD700" }; // Sarı
    case OrderStatus.PROCESSING:
      return { text: "Hazırlanıyor", color: "#1E90FF" }; // Mavi
    case OrderStatus.SHIPPED:
      return { text: "Kargoya Verildi", color: "#4169E1" }; // Koyu Mavi
    case OrderStatus.DELIVERED:
      return { text: "Teslim Edildi", color: "#32CD32" }; // Yeşil
    case OrderStatus.CANCELLED:
      return { text: "İptal Edildi", color: "#DC143C" }; // Kırmızı
    default:
      return { text: "Bilinmeyen Durum", color: "#808080" }; // Gri
  }
};
