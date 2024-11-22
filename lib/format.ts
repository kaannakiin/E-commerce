export const formattedDate = (date: string) => {
  return new Intl.DateTimeFormat("tr-TR", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
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
