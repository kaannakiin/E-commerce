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
