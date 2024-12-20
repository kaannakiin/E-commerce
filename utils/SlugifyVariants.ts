import { VariantType } from "@prisma/client";

interface VariantSlugOptions {
  productName: string;
  type: VariantType;
  value: string;
  unit?: string;
  prefix?: boolean;
  language?: "tr" | "en";
}

export function variantSlugify({
  productName,
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
    const sluggedProductName = slugify(productName);
    const typePrefix = prefix ? prefixes[language][type] : "";

    let variantPart = "";

    switch (type) {
      case "WEIGHT":
        variantPart = `${value}${unit || ""}`;
        break;
      case "COLOR":
        // Hex kodunun # işaretini kaldır ve küçük harfe çevir
        variantPart = value.replace("#", "").toLowerCase();
        break;
      case "SIZE":
        variantPart = value;
        break;
      default:
        variantPart = value;
    }

    const parts = [
      sluggedProductName,
      typePrefix,
      variantPart, // Renk hex kodu için slugify kullanmıyoruz
    ].filter(Boolean);

    return parts.join("-");
  };

  return type === "COLOR" ? createSlug() : slugify(createSlug());
}

export function slugify(text: string): string {
  const turkishChars = {
    ü: "u",
    Ü: "u",
    ı: "i",
    İ: "i",
    ş: "s",
    Ş: "s",
    ğ: "g",
    Ğ: "g",
    ç: "c",
    Ç: "c",
    ö: "o",
    Ö: "o",
  };

  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(
      new RegExp(Object.keys(turkishChars).join("|"), "g"),
      (char) => turkishChars[char],
    )
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}
