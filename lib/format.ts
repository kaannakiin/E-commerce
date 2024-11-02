export const formattedDate = (date: string) => {
  return new Intl.DateTimeFormat("tr-TR", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

export const formattedPrice = (price: number) => {
  return price.toLocaleString("tr-TR", { currency: "TRY", style: "currency" });
};
