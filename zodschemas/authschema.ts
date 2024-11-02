import { VariantType } from "@prisma/client";
import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .string({ message: "Bu alan zorunludur" })
    .email({ message: "Geçerli bir email adresi giriniz" }),
  password: z
    .string({ message: "Bu alan zorunludur" })
    .min(6, { message: "Şifreniz 6 haneden fazla olmalıdır" })
    .max(32, { message: "Şifreniz 32 haneden fazla olamaz" }),
});
export type LoginSchemaType = z.infer<typeof LoginSchema>;

export const RegisterSchema = z
  .object({
    email: z
      .string({ message: "Bu alan zorunludur" })
      .email({ message: "Geçerli bir email adresi giriniz" }),
    name: z
      .string()
      .min(1, { message: "İsim boş olamaz" })
      .max(20, { message: "İsim en fazla 20 karakter uzunluğunda olmalıdır" })
      .regex(/^[a-zA-ZğüşöçıİĞÜŞÖÇ\s]+$/, {
        message: "İsim sadece harflerden oluşmalı",
      }),
    surname: z
      .string({ message: "Bu alan zorunludur" })
      .min(1, { message: "Soyisim boş olamaz" })
      .max(20, {
        message: "Soyisim en fazla 20 karakter uzunluğunda olmalıdır",
      })
      .regex(/^[a-zA-ZğüşöçıİĞÜŞÖÇ\s]+$/, {
        message: "Soyisim sadece harflerden oluşmalı",
      }),
    password: z
      .string({ message: "Bu alan zorunludur" })
      .min(6, { message: "Şifreniz 6 haneden fazla olmalıdır" })
      .max(32, { message: "Şifreniz 32 haneden fazla olamaz" }),
    confirmPassword: z
      .string({ message: "Bu alan zorunludur" })
      .min(6, { message: "Şifreniz 6 haneden fazla olmalıdır" })
      .max(32, { message: "Şifreniz 32 haneden fazla olamaz" }),
    phone: z
      .string()
      .optional()
      .refine(
        (val) =>
          !val ||
          /^\(5([0345])([0-9]|(5[567])|([345])[0-9])\) ([0-9]{3}) ([0-9]{2}) ([0-9]{2})$/.test(
            val
          ),
        {
          message: "Geçerli bir cep telefon numarası giriniz",
        }
      ),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "Şifreler eşleşmiyor",
        path: ["confirmPassword"],
      });
    }
  });
export type RegisterSchemaType = z.infer<typeof RegisterSchema>;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SUPPORTED_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/jpg",
];

export const WeightUnit = z.enum(["ML", "L", "G", "KG"]);
export type WeightUnitType = z.infer<typeof WeightUnit>;

export const Size = z.enum(["XS", "S", "M", "L", "XL", "XXL"]);
export type SizeType = z.infer<typeof Size>;

// Base variant için iki ayrı versiyon oluşturuyoruz (Add ve Edit için)
const AddBaseVariantProps = z.object({
  price: z
    .number({ message: "Bu alan boş olamaz" })
    .min(0, { message: "Ürün fiyatı 0'dan küçük olamaz" }),
  discount: z
    .number({ message: "Bu alan boş olamaz" })
    .min(0, { message: "Ürün indirimi 0'dan küçük olamaz" })
    .default(0),
  active: z.boolean({ message: "Bu alan boş olamaz" }),
  stock: z
    .number({ message: "Bu alan boş olamaz" })
    .min(0, { message: "Ürün stok miktarı 0'dan küçük olamaz" }),
  imageFile: z
    .array(z.instanceof(File))
    .min(1, { message: "En az bir fotoğraf yüklemelisiniz" })
    .superRefine((files, ctx) => {
      if (files.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "En az bir fotoğraf yüklemelisiniz",
        });
        return;
      }
      files.forEach((file) => {
        if (file.size >= MAX_FILE_SIZE) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${file.name} dosya boyutu 10MB'dan küçük olmalıdır`,
          });
        }
        if (!SUPPORTED_FORMATS.includes(file.type)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${file.name} geçersiz dosya formatı. Desteklenen formatlar: .jpg, .jpeg, .png, .webp`,
          });
        }
      });
    }),
});

const EditBaseVariantProps = z.object({
  price: z
    .number({ message: "Bu alan boş olamaz" })
    .min(0, { message: "Ürün fiyatı 0'dan küçük olamaz" }),
  discount: z
    .number({ message: "Bu alan boş olamaz" })
    .min(0, { message: "Ürün indirimi 0'dan küçük olamaz" })
    .default(0),
  active: z.boolean({ message: "Bu alan boş olamaz" }),
  stock: z
    .number({ message: "Bu alan boş olamaz" })
    .min(0, { message: "Ürün stok miktarı 0'dan küçük olamaz" }),
  imageFile: z
    .array(z.instanceof(File))
    .optional()
    .superRefine((files, ctx) => {
      if (!files || files.length === 0) return; // Dosya yoksa kontrol etme

      files.forEach((file) => {
        if (file.size >= MAX_FILE_SIZE) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${file.name} dosya boyutu 10MB'dan küçük olmalıdır`,
          });
        }
        if (!SUPPORTED_FORMATS.includes(file.type)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${file.name} geçersiz dosya formatı. Desteklenen formatlar: .jpg, .jpeg, .png, .webp`,
          });
        }
      });
    }),
});

export const AddColorVariant = AddBaseVariantProps.extend({
  type: z.literal(VariantType.COLOR),
  value: z
    .string()
    .refine(
      (value) => {
        if (!value.startsWith("#")) return false;
        const hex = value.slice(1);
        if (![3, 6].includes(hex.length)) return false;
        const isValidHex = /^[0-9A-Fa-f]+$/.test(hex);
        return isValidHex;
      },
      {
        message: "Geçerli bir hex renk kodu giriniz (örn: #FF0000 veya #F00)",
      }
    )
    .transform((val) => {
      if (val.length === 4) {
        const hex = val.slice(1);
        return `#${hex
          .split("")
          .map((char) => char + char)
          .join("")}`;
      }
      return val.toUpperCase();
    }),
});

export const EditColorVariant = EditBaseVariantProps.extend({
  type: z.literal(VariantType.COLOR),
  value: z
    .string()
    .refine(
      (value) => {
        if (!value.startsWith("#")) return false;
        const hex = value.slice(1);
        if (![3, 6].includes(hex.length)) return false;
        const isValidHex = /^[0-9A-Fa-f]+$/.test(hex);
        return isValidHex;
      },
      {
        message: "Geçerli bir hex renk kodu giriniz (örn: #FF0000 veya #F00)",
      }
    )
    .transform((val) => {
      if (val.length === 4) {
        const hex = val.slice(1);
        return `#${hex
          .split("")
          .map((char) => char + char)
          .join("")}`;
      }
      return val.toUpperCase();
    }),
});

export const AddSizeVariant = AddBaseVariantProps.extend({
  type: z.literal(VariantType.SIZE),
  value: Size,
});

export const EditSizeVariant = EditBaseVariantProps.extend({
  type: z.literal(VariantType.SIZE),
  value: Size,
});

export const AddWeightVariant = AddBaseVariantProps.extend({
  type: z.literal(VariantType.WEIGHT),
  value: z
    .number({ message: "Bu alan boş olamaz" })
    .min(0, { message: "Ağırlık 0'dan küçük olamaz" }),
  unit: WeightUnit,
});

export const EditWeightVariant = EditBaseVariantProps.extend({
  type: z.literal(VariantType.WEIGHT),
  value: z
    .number({ message: "Bu alan boş olamaz" })
    .min(0, { message: "Ağırlık 0'dan küçük olamaz" }),
  unit: WeightUnit,
});

const AddVariant = z.discriminatedUnion("type", [
  AddColorVariant,
  AddSizeVariant,
  AddWeightVariant,
]);

const EditVariant = z.discriminatedUnion("type", [
  EditColorVariant,
  EditSizeVariant,
  EditWeightVariant,
]);

// Ürün ekleme için schema
export const AddProductSchema = z.object({
  name: z.string().min(1, "Ürün adı zorunludur"),
  description: z.string().min(1, "Ürün açıklaması zorunludur"),
  shortDescription: z.string().min(1, "Kısa açıklama zorunludur"),
  categories: z
    .array(z.string({ message: "Bu alan zorunludur" }))
    .min(1, "En az bir kategori seçilmelidir"),
  variants: z.array(AddVariant).min(1, "En az bir varyant eklenmelidir"),
});

// Ürün düzenleme için schema
export const EditProductSchema = z.object({
  name: z.string().min(1, "Ürün adı zorunludur"),
  description: z.string().min(1, "Ürün açıklaması zorunludur"),
  shortDescription: z.string().min(1, "Kısa açıklama zorunludur"),
  categories: z
    .array(z.string({ message: "Bu alan zorunludur" }))
    .min(1, "En az bir kategori seçilmelidir"),
  variants: z.array(EditVariant).min(1, "En az bir varyant eklenmelidir"),
});

export type AddProductSchemaType = z.infer<typeof AddProductSchema>;
export type EditProductSchemaType = z.infer<typeof EditProductSchema>;
export type AddColorVariantType = z.infer<typeof AddColorVariant>;
export type EditColorVariantType = z.infer<typeof EditColorVariant>;
export type AddSizeVariantType = z.infer<typeof AddSizeVariant>;
export type EditSizeVariantType = z.infer<typeof EditSizeVariant>;
export type AddWeightVariantType = z.infer<typeof AddWeightVariant>;
export type EditWeightVariantType = z.infer<typeof EditWeightVariant>;
