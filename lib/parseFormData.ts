import { VariantType as Variants } from "@prisma/client";
interface WeightVariant {
  price: number;
  discount: number;
  active: boolean;
  stock: number;
  type: Variants;
  value: number;
  unit: string;
  imageFile: File[];
}

interface ColorVariant {
  price: number;
  discount: number;
  active: boolean;
  stock: number;
  type: Variants;
  value: string;
  imageFile: File[];
}

interface SizeVariant {
  price: number;
  discount: number;
  active: boolean;
  stock: number;
  type: Variants;
  value: string;
  imageFile: File[];
}

type Variant = WeightVariant | ColorVariant | SizeVariant;

interface ParsedProductData {
  name: string;
  description: string;
  shortDescription: string;
  categories: string[];
  variants: Variant[];
}

export const parseNextFormData = async (
  formData: FormData
): Promise<ParsedProductData> => {
  const result: ParsedProductData = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    shortDescription: formData.get("shortDescription") as string,
    categories: [],
    variants: [],
  };

  // Kategorileri parse et
  const categoryEntries = Array.from(formData.entries())
    .filter(([key]) => key.startsWith("categories["))
    .sort((a, b) => {
      const indexA = parseInt(a[0].match(/\[(\d+)\]/)?.[1] || "0");
      const indexB = parseInt(b[0].match(/\[(\d+)\]/)?.[1] || "0");
      return indexA - indexB;
    });

  result.categories = categoryEntries.map(([_, value]) => value.toString());

  // Varyantları parse et
  const variantKeys = Array.from(formData.keys())
    .filter((key) => key.startsWith("variants["))
    .map((key) => {
      const match = key.match(/variants\[(\d+)\]/);
      return match ? parseInt(match[1]) : -1;
    })
    .filter((index) => index !== -1);

  const variantIndices = [...new Set(variantKeys)];

  for (const index of variantIndices) {
    const baseKey = `variants[${index}]`;
    const type = formData.get(`${baseKey}[type]`) as Variants;

    const baseVariant = {
      price: parseFloat(formData.get(`${baseKey}[price]`) as string),
      discount: parseFloat(formData.get(`${baseKey}[discount]`) as string),
      active: formData.get(`${baseKey}[active]`) === "true",
      stock: parseInt(formData.get(`${baseKey}[stock]`) as string),
      type,
      imageFile: [] as File[],
    };

    // Dosyaları topla
    const imageFileKeys = Array.from(formData.keys()).filter((key) =>
      key.startsWith(`${baseKey}[imageFile]`)
    );

    const imageFiles: File[] = [];
    for (const key of imageFileKeys) {
      const file = formData.get(key) as File;
      if (file instanceof File) {
        imageFiles.push(file);
      }
    }

    let variant: Variant;

    switch (type) {
      case Variants.WEIGHT:
        variant = {
          ...baseVariant,
          type: Variants.WEIGHT,
          value: parseFloat(formData.get(`${baseKey}[value]`) as string),
          unit: formData.get(`${baseKey}[unit]`) as string,
          imageFile: imageFiles,
        };
        break;

      case Variants.COLOR:
        variant = {
          ...baseVariant,
          type: Variants.COLOR,
          value: formData.get(`${baseKey}[value]`) as string,
          imageFile: imageFiles,
        };
        break;

      case Variants.SIZE:
        variant = {
          ...baseVariant,
          type: Variants.SIZE,
          value: formData.get(`${baseKey}[value]`) as string,
          imageFile: imageFiles,
        };
        break;
    }

    result.variants.push(variant!);
  }

  return result;
};
