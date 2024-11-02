import {
  AddColorVariantType,
  AddProductSchemaType,
  AddSizeVariantType,
  AddWeightVariantType,
} from "@/zodschemas/authschema";
import { VariantType as VariantTypes } from "@prisma/client";

type VariantType =
  | AddColorVariantType
  | AddSizeVariantType
  | AddWeightVariantType;

export const createProductFormData = (data: AddProductSchemaType): FormData => {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("description", data.description);
  formData.append("shortDescription", data.shortDescription);

  data.categories.forEach((categoryId, index) => {
    formData.append(`categories[${index}]`, categoryId);
  });

  data.variants.forEach((variant: VariantType, variantIndex) => {
    const variantBase = `variants[${variantIndex}]`;

    formData.append(`${variantBase}[price]`, variant.price.toString());
    formData.append(`${variantBase}[discount]`, variant.discount.toString());
    formData.append(`${variantBase}[active]`, variant.active.toString());
    formData.append(`${variantBase}[stock]`, variant.stock.toString());
    formData.append(`${variantBase}[type]`, variant.type);
    variant.imageFile.forEach((file, imageIndex) => {
      formData.append(
        `${variantBase}[imageFile][${imageIndex}]`,
        file,
        file.name
      );
    });

    switch (variant.type) {
      case VariantTypes.COLOR:
        formData.append(`${variantBase}[value]`, variant.value);
        break;
      case VariantTypes.SIZE:
        formData.append(`${variantBase}[value]`, variant.value);
        break;
      case VariantTypes.WEIGHT:
        formData.append(`${variantBase}[value]`, variant.value.toString());
        formData.append(
          `${variantBase}[unit]`,
          (variant as AddWeightVariantType).unit
        );
        break;
    }
  });

  return formData;
};
