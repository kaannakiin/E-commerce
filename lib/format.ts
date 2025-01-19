import {
  UserCancelReason,
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
    case "PROCESSING":
      return "Hazırlanıyor";
    case "PENDING":
      return "Sipariş Alındı";
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
    case "REFUND":
      return { text: "İade Edildi", color: "  " };
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
    text: "Onay Bekliyor",
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
export const formatCancelReason = (reason: UserCancelReason) => {
  switch (reason) {
    case UserCancelReason.WRONG_ADDRESS:
      return { text: "Teslimat adresi hatalı", color: "orange" };
    case UserCancelReason.CHANGED_MIND:
      return { text: "Fikir değişikliği", color: "blue" };
    case UserCancelReason.FOUND_BETTER_PRICE:
      return { text: "Daha uygun fiyat buldum", color: "cyan" };
    case UserCancelReason.ACCIDENTAL_ORDER:
      return { text: "Yanlışlıkla sipariş verildi", color: "yellow" };
    case UserCancelReason.DELIVERY_TIME_LONG:
      return { text: "Teslimat süresi çok uzun", color: "grape" };
    case UserCancelReason.PAYMENT_CHANGE:
      return { text: "Ödeme yöntemini değiştirmek istiyorum", color: "indigo" };
    case UserCancelReason.ITEM_FEATURES:
      return { text: "Ürün özellikleri beklediğim gibi değil", color: "red" };
    case UserCancelReason.QUANTITY_CHANGE:
      return { text: "Adet değişikliği yapmak istiyorum", color: "teal" };
    case UserCancelReason.PERSONAL_REASON:
      return { text: "Kişisel nedenler", color: "violet" };
    case UserCancelReason.OTHER:
      return { text: "Diğer", color: "gray" };
    default:
      return { text: "Bilinmeyen Neden", color: "dark" };
  }
};
