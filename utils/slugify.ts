import { VariantType } from "@prisma/client";

interface VariantSlugOptions {
  type: VariantType;
  value: string;
  unit?: string;
  prefix?: boolean;
  language?: "tr" | "en";
}

export function generateVariantSlug({
  type,
  value,
  unit,
  prefix = true,
  language = "tr",
}: VariantSlugOptions): string {
  const prefixes = {
    tr: {
      WEIGHT: "agirlik",
      COLOR: "renk",
      SIZE: "beden",
    },
    en: {
      WEIGHT: "weight",
      COLOR: "color",
      SIZE: "size",
    },
  };

  const createSlug = () => {
    switch (type) {
      case "WEIGHT":
        return prefix
          ? `${prefixes[language].WEIGHT}-${value}${unit}`.toLowerCase()
          : `${value}${unit}`.toLowerCase();

      case "COLOR":
        if (value.startsWith("#")) {
          return prefix
            ? `${prefixes[language].COLOR}-${value.slice(1)}`.toLowerCase()
            : value.slice(1).toLowerCase();
        }
        return prefix
          ? `${prefixes[language].COLOR}-${value}`.toLowerCase()
          : value.toLowerCase();

      case "SIZE":
        return prefix
          ? `${prefixes[language].SIZE}-${value}`.toLowerCase()
          : value.toLowerCase();

      default:
        return `${type}-${value}`.toLowerCase();
    }
  };

  return slugify(createSlug());
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Boşlukları tire ile değiştir
    .replace(/[üÜ]/g, "u") // Türkçe karakterleri değiştir
    .replace(/[ıİ]/g, "i")
    .replace(/[şŞ]/g, "s")
    .replace(/[ğĞ]/g, "g")
    .replace(/[çÇ]/g, "c")
    .replace(/[öÖ]/g, "o")
    .replace(/[^a-z0-9-]/g, "") // Alfanumerik ve tire dışındakileri kaldır
    .replace(/-+/g, "-") // Ardışık tireleri tek tireye dönüştür
    .replace(/^-+|-+$/g, ""); // Baş ve sondaki tireleri kaldır
}
