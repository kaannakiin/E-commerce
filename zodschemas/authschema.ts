import { DiscountType, OrderStatus, VariantType } from "@prisma/client";
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
            val,
          ),
        {
          message: "Geçerli bir cep telefon numarası giriniz",
        },
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
  isSpotlightPublished: z.boolean({ message: "Bu alan boş olamaz" }),
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
      },
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
      },
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
  taxPrice: z
    .number({ message: "Bu alan boş olamaz" })
    .min(0, { message: "Vergi fiyatı 0'dan küçük olamaz" }),
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
  taxPrice: z
    .number({ message: "Bu alan boş olamaz" })
    .min(0, { message: "Vergi fiyatı 0'dan küçük olamaz" }),
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

export const AddCategorySchema = z.object({
  name: z
    .string({ message: "Bu alan boş olamaz" })
    .min(1, "Kategori adı zorunludur"),
  description: z
    .string({ message: "Bu alan boş olamaz" })
    .min(1, "Kategori açıklaması zorunludur"),
  active: z.boolean({ message: "Bu alan boş olamaz" }),

  imageFile: z.array(z.instanceof(File)).superRefine((files, ctx) => {
    if (!files || files.length === 0)
      ctx.addIssue({
        code: "custom",
        message: "En az bir fotoğraf eklemelisiniz",
      });
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

export type AddCategorySchemaType = z.infer<typeof AddCategorySchema>;
export const EditCategorySchema = z.object({
  name: z
    .string({ message: "Bu alan boş olamaz" })
    .min(1, "Kategori adı zorunludur"),
  description: z
    .string({ message: "Bu alan boş olamaz" })
    .min(1, "Kategori açıklaması zorunludur"),
  active: z.boolean({ message: "Bu alan boş olamaz" }),
  imageFile: z
    .array(z.instanceof(File))
    .optional()
    .superRefine((files, ctx) => {
      if (!files) return;
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
export type EditCategorySchemaType = z.infer<typeof EditCategorySchema>;

export const AddHeroSchema = z.object({
  title: z
    .string({ message: "Bu alan boş olamaz" })
    .min(1, "Başlık zorunludur"),
  text: z.string({ message: "Bu alan boş olamaz" }).min(1, "Metin zorunludur"),
  buttonTitle: z
    .string({ message: "Bu alan boş olamaz" })
    .min(1, "Buton başlığı zorunludur"),
  buttonLink: z
    .string({ message: "Bu alan boş olamaz" })
    .min(1, "Link zorunludur"),
  imageFile: z
    .array(z.instanceof(File))
    .length(1, "Bir adet fotoğraf eklemelisiniz")
    .superRefine((files, ctx) => {
      if (!files || files.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: "Bir fotoğraf eklemelisiniz",
        });
      }
      if (files.length > 1) {
        ctx.addIssue({
          code: "custom",
          message: "Sadece bir fotoğraf yükleyebilirsiniz",
        });
      }
      files.forEach((file) => {
        if (file.size >= MAX_FILE_SIZE) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${file.name} dosya boyutu 10MB'dan küçük olmalıdır`,
          });
        }

        const SUPPORTED_FORMATS = [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
          "video/mp4",
        ];

        if (!SUPPORTED_FORMATS.includes(file.type)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${file.name} geçersiz dosya formatı. Desteklenen formatlar: .jpg, .jpeg, .png, .webp, .gif`,
          });
        }
      });
    }),
});
export type AddHeroSchemaType = z.infer<typeof AddHeroSchema>;
export const EditHeroSchema = z.object({
  title: z
    .string({ message: "Bu alan boş olamaz" })
    .min(1, "Başlık zorunludur"),
  text: z.string({ message: "Bu alan boş olamaz" }).min(1, "Metin zorunludur"),
  buttonTitle: z
    .string({ message: "Bu alan boş olamaz" })
    .min(1, "Buton başlığı zorunludur"),
  buttonLink: z
    .string({ message: "Bu alan boş olamaz" })
    .min(1, "Link zorunludur"),
  imageFile: z
    .optional(z.array(z.instanceof(File)))
    .superRefine((files, ctx) => {
      // Eğer files null/undefined veya boş array ise kontrol etme
      if (!files || files.length === 0) return;

      files.forEach((file) => {
        if (file.size >= MAX_FILE_SIZE) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${file.name} dosya boyutu 10MB'dan küçük olmalıdır`,
          });
        }
        const SUPPORTED_FORMATS = [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
          "video/mp4",
        ];
        if (!SUPPORTED_FORMATS.includes(file.type)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${file.name} geçersiz dosya formatı. Desteklenen formatlar: .jpg, .jpeg, .png, .webp, .gif`,
          });
        }
      });
    }),
});
export type EditHeroSchemaType = z.infer<typeof EditHeroSchema>;
const turkishPhoneRegex =
  /([(]?)([5])([0-9]{2})([)]?)([\s]?)([0-9]{3})([\s]?)([0-9]{2})([\s]?)([0-9]{2})$/g;

export const checkoutFormSchema = z.object({
  firstName: z
    .string()
    .min(2, "Ad en az 2 karakter olmalıdır")
    .max(50, "Ad en fazla 50 karakter olabilir")
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, "Ad sadece harflerden oluşmalıdır"),

  lastName: z
    .string()
    .min(2, "Soyad en az 2 karakter olmalıdır")
    .max(50, "Soyad en fazla 50 karakter olabilir")
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, "Soyad sadece harflerden oluşmalıdır"),

  email: z
    .string()
    .email("Geçerli bir e-posta adresi giriniz")
    .min(5, "E-posta adresi en az 5 karakter olmalıdır")
    .max(100, "E-posta adresi en fazla 100 karakter olabilir"),

  phone: z
    .string()
    .regex(turkishPhoneRegex, "Geçerli bir telefon numarası giriniz "),

  address: z.object({
    street: z
      .string()
      .min(5, "Adres en az 5 karakter olmalıdır")
      .max(100, "Adres en fazla 100 karakter olabilir"),

    city: z
      .string()
      .min(2, "Şehir en az 2 karakter olmalıdır")
      .max(50, "Şehir en fazla 50 karakter olabilir"),

    district: z
      .string()
      .min(2, "İlçe en az 2 karakter olmalıdır")
      .max(50, "İlçe en fazla 50 karakter olabilir"),
  }),

  // Kart Bilgileri
  cardInfo: z.object({
    cardHolderName: z
      .string()
      .min(5, "Kart üzerindeki isim en az 5 karakter olmalıdır")
      .max(100, "Kart üzerindeki isim en fazla 100 karakter olabilir")
      .regex(
        /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/,
        "Kart üzerindeki isim sadece harflerden oluşmalıdır",
      ),

    cardNumber: z
      .string()
      .min(1, "Kart numarası zorunludur.")
      .regex(/^\d{4} \d{4} \d{4} \d{4}$/, "Lütfen geçerli bir kart giriniz."),

    expireMonth: z
      .string()
      .length(2, "Ay 2 haneli olmalıdır")
      .regex(/^(0[1-9]|1[0-2])$/, "Geçerli bir ay giriniz (01-12)"),

    expireYear: z
      .string()
      .length(4, "Yıl 4 haneli olmalıdır")
      .regex(/^[0-9]+$/, "Yıl sadece rakamlardan oluşmalıdır"),

    cvc: z
      .string()
      .length(3, "CVC kodu 3 haneli olmalıdır")
      .regex(/^[0-9]+$/, "CVC kodu sadece rakamlardan oluşmalıdır"),
    threeDsecure: z.boolean().default(false),
  }),

  // Sözleşme Onayları
  agreements: z.object({
    termsAccepted: z.literal(true, {
      errorMap: () => ({
        message: "Mesafeli satış sözleşmesini kabul etmelisiniz",
      }),
    }),
    privacyAccepted: z.literal(true, {
      errorMap: () => ({ message: "Gizlilik politikasını kabul etmelisiniz" }),
    }),
  }),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

const DiscountTypeEnum = z.enum([DiscountType.FIXED, DiscountType.PERCENTAGE]);
export const AddDiscountCodeSchema = z
  .object({
    code: z
      .string()
      .min(1, { message: "Kupon kodu boş olamaz" })
      .max(10, { message: "Kupon kodu en fazla 10 karakter olabilir" }),
    discountAmount: z
      .number({
        required_error: "İndirim tutarı zorunludur",
        invalid_type_error: "İndirim tutarı sayı olmalıdır",
      })
      .min(1, { message: "İndirim tutarı en az 1 olmalıdır" })
      .max(99999, { message: "İndirim tutarı çok yüksek" })
      .refine((val) => Number.isInteger(val), {
        message: "İndirim tutarı tam sayı olmalıdır",
      }),
    discountType: DiscountTypeEnum,
    active: z.boolean().default(true),
    allProducts: z.boolean().default(false),
    hasLimit: z.boolean().default(false),
    hasExpiryDate: z.boolean().default(false),
    limit: z.preprocess((val) => {
      // Boş string veya null ise null döndür
      if (val === "" || val === null || val === undefined) return null;
      // Sayı ise number'a çevir
      const processed = Number(val);
      return isNaN(processed) ? null : processed;
    }, z.number().min(1).nullable()),
    expiresAt: z
      .date({
        invalid_type_error: "Geçersiz tarih formatı",
      })
      .min(new Date(), { message: "Geçerlilik tarihi geçmiş bir tarih olamaz" })
      .nullable(),
    variants: z
      .array(z.string().uuid({ message: "Geçersiz variant ID" }))
      .optional()
      .default([]),
  })
  .refine(
    (data) => {
      if (data.discountType === DiscountType.PERCENTAGE) {
        return data.discountAmount <= 100;
      }
      return true;
    },
    {
      message: "Yüzdelik indirim tutarı 100'den büyük olamaz",
      path: ["discountAmount"],
    },
  )
  .refine(
    (data) => {
      if (data.hasLimit) {
        return data.limit !== null && data.limit > 0;
      }
      return true;
    },
    {
      message: "Kullanım limiti belirtilmelidir",
      path: ["limit"],
    },
  )
  .refine(
    (data) => {
      if (data.hasExpiryDate) {
        return data.expiresAt !== null;
      }
      return true;
    },
    {
      message: "Son kullanım tarihi belirtilmelidir",
      path: ["expiresAt"],
    },
  )
  .refine(
    (data) => {
      if (!data.allProducts) {
        return data.variants.length > 0;
      }
      return true;
    },
    {
      message: "En az bir ürün varyantı seçilmelidir",
      path: ["variants"],
    },
  );

export type AddDiscountCodeSchemaType = z.infer<typeof AddDiscountCodeSchema>;
export const EditDiscountCodeSchema = z
  .object({
    discountAmount: z
      .number({
        required_error: "İndirim tutarı zorunludur",
        invalid_type_error: "İndirim tutarı sayı olmalıdır",
      })
      .min(1, { message: "İndirim tutarı en az 1 olmalıdır" })
      .max(99999, { message: "İndirim tutarı çok yüksek" })
      .refine((val) => Number.isInteger(val), {
        message: "İndirim tutarı tam sayı olmalıdır",
      }),
    discountType: DiscountTypeEnum,
    allProducts: z.boolean().default(false),
    hasLimit: z.boolean().default(false),
    hasExpiryDate: z.boolean().default(false),
    limit: z
      .union([
        z.string().trim().length(0), // Boş string için
        z
          .number()
          .int({ message: "Limit tam sayı olmalıdır" })
          .min(1, { message: "Limit en az 1 olmalıdır" }),
      ])
      .optional()
      .transform((val) => {
        if (!val || val === "") return null; // Boş string veya undefined ise null
        return Number(val); // Sayı ise number'a çevir
      })
      .nullable(),
    expiresAt: z
      .date({
        required_error: "Geçerlilik tarihi zorunludur",
        invalid_type_error: "Geçersiz tarih formatı",
      })
      .min(new Date(), { message: "Geçerlilik tarihi geçmiş bir tarih olamaz" })
      .nullable()
      .optional(),
    variants: z
      .array(z.string().uuid({ message: "Geçersiz variant ID" }))
      .optional()
      .default([]),
  })
  .refine(
    (data) => {
      if (data.discountType === DiscountType.PERCENTAGE) {
        return data.discountAmount <= 100;
      }
      return true;
    },
    {
      message: "Yüzdelik indirim tutarı 100'den büyük olamaz",
      path: ["discountAmount"],
    },
  )
  .refine(
    (data) => {
      if (!data.allProducts) {
        return data.variants.length > 0;
      }
      return true;
    },
    {
      message: "En az bir ürün varyantı seçilmelidir",
      path: ["variants"],
    },
  )
  .refine(
    (data) => {
      // hasLimit true ise limit zorunlu
      if (data.hasLimit) {
        return data.limit !== null && data.limit !== undefined;
      }
      return true;
    },
    {
      message: "Limit belirlenmelidir",
      path: ["limit"],
    },
  )
  .refine(
    (data) => {
      // hasExpiryDate true ise expiresAt zorunlu
      if (data.hasExpiryDate) {
        return data.expiresAt !== null && data.expiresAt !== undefined;
      }
      return true;
    },
    {
      message: "Son kullanım tarihi belirlenmelidir",
      path: ["expiresAt"],
    },
  );

export type EditDiscountCodeSchemaType = z.infer<typeof EditDiscountCodeSchema>;

export const discountCode = z.object({
  code: z
    .string({ message: "Lütfen bir kod girin" })
    .min(1, { message: "Lütfen bir kod girin" }),
});
export type DiscountCodeType = z.infer<typeof discountCode>;
// searchSchema.ts
// searchSchema.ts
export const searchSchema = z
  .string()
  .optional()
  .transform((value) => value?.trim())
  .refine((value) => !value || value.length === 12, {
    message: "Sipariş numarası 12 karakter olmalıdır",
  });

// dateSchema.ts
export const dateSchema = z.object({
  startDate: z.date().nullable().optional(),
  endDate: z.date().nullable().optional(),
});

export const statusSchema = z
  .string()
  .optional()
  .nullable()
  .transform((value) => (value ? (value as OrderStatus) : null));
export const orderSearchSchema = z
  .object({
    search: searchSchema,
    startDate: z.date().nullable().optional(),
    endDate: z.date().nullable().optional(),
    status: statusSchema,
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
      }
      return true;
    },
    {
      message: "İlk tarih ikinci tarihten sonra olamaz",
      path: ["endDate"],
    },
  )
  .refine(
    (data) => {
      const hasSearch = Boolean(data.search?.trim());
      const hasDate = Boolean(data.startDate || data.endDate);
      const hasStatus = Boolean(data.status);
      return hasSearch || hasDate || hasStatus;
    },
    {
      message: "En az bir arama kriteri gereklidir",
      path: ["root"],
    },
  );
export type SearchOrderSchemaType = z.infer<typeof orderSearchSchema>;
export const returnFormSchema = z.object({
  quantity: z
    .number()
    .min(1, "En az 1 adet ürün seçmelisiniz")
    .max(99, "Maksimum 99 adet ürün iade edilebilir"),
  reason: z.string().min(1, "İade nedeni seçmelisiniz"),
  amount: z.number().min(0, "Tutar 0'dan küçük olamaz"),
});
export type ReturnFormValues = z.infer<typeof returnFormSchema>;

export const addressSchema = z.object({
  name: z
    .string({ message: "Bu alan zorunludur." })
    .min(1, { message: "Ad en az 1 karakter olmalıdır" })
    .max(30, { message: "Ad en fazla 30 karakter olabilir" }),
  surname: z
    .string({ message: "Bu alan zorunludur." })
    .min(1, { message: "Soyad en az 1 karakter olmalıdır" })
    .max(30, { message: "Soyad en fazla 30 karakter olabilir" }),
  phone: z
    .string({ message: "Bu alan zorunludur" })
    .refine(
      (val) =>
        !val ||
        /^\(5([0345])([0-9]|(5[567])|([345])[0-9])\) ([0-9]{3}) ([0-9]{2}) ([0-9]{2})$/.test(
          val,
        ),
      {
        message: "Geçerli bir cep telefon numarası giriniz",
      },
    ),
  addressTitle: z
    .string({ message: "Bu alan zorunludur" })
    .min(1, { message: "Adres başlığı en az 1 karakter olmalıdır" })
    .max(30, { message: "Adres başlığı en fazla 30 karakter olabilir" }),
  city: z.string({ message: "Bu alan zorunludur" }).min(1, {
    message: "Bu alan zorunludur",
  }),
  district: z.string({ message: "Bu alan zorunludur" }).min(1, {
    message: "Bu alan zorunludur",
  }),
  addressBook: z
    .string({ message: "Bu alan zorunludur" })
    .min(20, { message: "Adres en az 20 karakter olmalıdır" })
    .max(150, {
      message: "Adres en fazla 150 karakter olabilir",
    }),
});
export type AddressFormValues = z.infer<typeof addressSchema>;
export const addUserServer = addressSchema.extend({
  email: z
    .string({ message: "Bu alan zorunlu" })
    .email({ message: "Geçerli bir e-posta adresi giriniz" }),
});
export type AddUserServerType = z.infer<typeof addUserServer>;

export const idForEverything = z
  .string({ message: "Bu alan zorunlu" })
  .cuid({ message: "Geçerli bir ID giriniz" });
export type IdForEverythingType = z.infer<typeof idForEverything>;
export const serverEditAddressSchema = addUserServer.extend({
  id: idForEverything,
});

export type ServerEditAddressType = z.infer<typeof serverEditAddressSchema>;
