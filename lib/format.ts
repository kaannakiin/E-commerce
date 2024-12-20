import {
  CancelReason,
  OrderStatus,
  PaymentStatus,
  RefundStatus,
} from "@prisma/client";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
export const formattedDate = (date: string) => {
  return format(parseISO(date), "dd MMMM yyyy HH:mm", {
    locale: tr, // Türkçe lokalizasyon
  });
};
export const getTurkeyTime = () => {
  const now = new Date();
  return new Date(now.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" }));
};

export const formattedPrice = (price: number) => {
  if (!price)
    return Number(0).toLocaleString("tr-TR", {
      currency: "TRY",
      style: "currency",
    });
  return price.toLocaleString("tr-TR", { currency: "TRY", style: "currency" });
};
export const formatOrderStatus = (status: OrderStatus) => {
  switch (status) {
    case "CANCELLED":
      return "İptal Edildi";
    case "DELIVERED":
      return "Teslim Edildi";
    case "PROCESSING":
      return "Hazırlanıyor";
    case "PENDING":
      return "Ödeme bekleniyor";
    case "SHIPPED":
      return "Kargoya verildi";
    case "COMPLETED":
      return "Teslim Edildi";
  }
};
export const formatPaymentStatus = (status: PaymentStatus) => {
  switch (status) {
    case "FAILED":
      return "Başarısız Oldu";
    case "PENDING":
      return "Ödeme bekleniyor";
    case "SUCCESS":
      return "Ödendi";
  }
};
export const formatPaymentStatusWithColor = (status: PaymentStatus) => {
  switch (status) {
    case "FAILED":
      return { text: "Başarısız Oldu", color: "red" };
    case "PENDING":
      return { text: "Ödeme bekleniyor", color: "blue" };
    case "SUCCESS":
      return { text: "Ödendi", color: "green" };
  }
};
export const isPaymentSameDay = (paymentDate: string) => {
  const date = new Date(paymentDate);
  const now = new Date();

  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
};
export const formatRefundStatus = (status: RefundStatus) => {
  switch (status) {
    case "NONE":
      return { text: "İade Talebi Yok", color: "blue" };
    case "REQUESTED":
      return { text: "İade Talep Edildi", color: "blue" };
    case "PROCESSING":
      return { text: "İade İşleniyor", color: "blue" };
    case "COMPLETED":
      return { text: "İade Tamamlandı", color: "green" };
    case "REJECTED":
      return { text: "İade Reddedildi", color: "red" };
    default:
      return { text: "İade Talebi Yok", color: "gray" };
  }
};
const ORDER_STATUS_CONFIGS: Record<OrderStatus, OrderStatusConfig> = {
  PENDING: {
    text: "Ödeme bekleniyor",
    color: "yellow",
  },
  PROCESSING: {
    text: "Hazırlanıyor",
    color: "blue",
  },
  SHIPPED: {
    text: "Kargoya verildi",
    color: "indigo",
  },
  DELIVERED: {
    text: "Teslim Edildi",
    color: "teal",
  },
  CANCELLED: {
    text: "İptal Edildi",
    color: "red",
  },
  COMPLETED: {
    text: "Teslim Edildi",
    color: "green",
  },
};
type OrderStatusConfig = {
  text: string;
  color: string;
};
export const getOrderStatusConfig = (
  status: OrderStatus,
): OrderStatusConfig => {
  return ORDER_STATUS_CONFIGS[status];
};
export const formatCancelReason = (reason: CancelReason) => {
  switch (reason) {
    case "CUSTOMER_REQUEST":
      return { text: "Müşteri İsteği", color: "blue" };
    case "STOCK_PROBLEM":
      return { text: "Stok Problemi", color: "red" };
    case "PRICE_ERROR":
      return { text: "Fiyat Hatası", color: "orange" };
    case "DUPLICATE_ORDER":
      return { text: "Mükerrer Sipariş", color: "yellow" };
    case "DELIVERY_AREA":
      return { text: "Teslimat Bölgesi Dışında", color: "grape" };
    case "PAYMENT_ISSUE":
      return { text: "Ödeme Sorunu", color: "red" };
    case "VARIANT_UNAVAILABLE":
      return { text: "Varyant Mevcut Değil", color: "orange" };
    case "SYSTEM_ERROR":
      return { text: "Sistem Hatası", color: "red" };
    case "SELLER_REQUEST":
      return { text: "Satıcı İsteği", color: "indigo" };
    case "OTHER":
      return { text: "Diğer Nedenler", color: "gray" };
    default:
      return { text: "Bilinmeyen Neden", color: "gray" };
  }
};
