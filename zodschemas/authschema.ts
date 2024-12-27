import {
  DiscountType,
  OrderStatus,
  ProductType,
  VariantType,
} from "@prisma/client";
import { z } from "zod";
export const forgotPasswordSchema = z.object({
  email: z
    .string({ message: "Bu alan zorunludur" })
    .email({ message: "Geçerli bir email adresi giriniz" }),
});
export type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>;
export const passwordCheckSchema = z
  .object({
    password: z
      .string({ message: "Bu alan zorunludur" })
      .min(6, { message: "Şifreniz en az 6 karakter olmalıdır" }),
    confirmPassword: z
      .string({ message: "Bu alan zorunludur" })
      .min(6, { message: "Şifreniz en az 6 karakter olmalıdır" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });
export type PasswordCheckType = z.infer<typeof passwordCheckSchema>;
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
      .string({ message: "Bu alan zorunludur" })
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
      .string({ message: "Bu alan zorunludur" })
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
    termsAndPrivacyPolicy: z.boolean().refine((val) => val === true, {
      message: "Sözleşmeleri kabul etmelisiniz",
    }),
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
  "image/jpg",
];

export const AddSliderSchema = z.object({
  title: z
    .string()
    .max(50, "Başlık en fazla 50 karakter olabilir")
    .optional()
    .nullable(),

  text: z
    .string({ message: "Bu alan zorunludur" })
    .max(200, "Metin en fazla 200 karakter olabilir")
    .optional()
    .nullable(),
  isDescription: z.boolean({ message: "Bu alan zorunludur" }).default(false),
  alt: z
    .string({ message: "Bu alan zorunludur" })
    .min(1, { message: "Bu alan zorunludur" })
    .max(50, "Alt metin en fazla 50 karakter olabilir"),
  buttonTitle: z
    .string()
    .max(20, "Buton başlığı en fazla 20 karakter olabilir")
    .optional()
    .nullable(),

  buttonLink: z
    .string()
    .max(100, "Link en fazla 100 karakter olabilir")
    .optional()
    .nullable()
    .refine((val) => !val || val.startsWith("/"), {
      message: "Link '/' ile başlamalıdır",
    }),
  isPublished: z.boolean({ message: "Bu alan zorunludur" }).default(true),
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
export type AddSliderSchemaType = z.infer<typeof AddSliderSchema>;
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

export const nonAuthSchema = z.object({
  firstName: z
    .string({ message: "Bu alan boş olamaz" })
    .min(2, "Ad en az 2 karakter olmalıdır")
    .max(50, "Ad en fazla 50 karakter olabilir")
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, "Ad sadece harflerden oluşmalıdır"),
  lastName: z
    .string({ message: "Bu alan boş olamaz" })
    .min(2, "Soyad en az 2 karakter olmalıdır")
    .max(50, "Soyad en fazla 50 karakter olabilir")
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, "Soyad sadece harflerden oluşmalıdır"),
  email: z
    .string({ message: "Bu alan boş olamaz" })
    .email("Geçerli bir e-posta adresi giriniz")
    .min(5, "E-posta adresi en az 5 karakter olmalıdır")
    .max(100, "E-posta adresi en fazla 100 karakter olabilir"),
  phone: z
    .string({ message: "Bu alan boş olamaz" })
    .regex(turkishPhoneRegex, "Geçerli bir telefon numarası giriniz "),
  address: z.object({
    street: z
      .string({ message: "Bu alan boş olamaz" })
      .min(5, "Adres en az 5 karakter olmalıdır")
      .max(100, "Adres en fazla 100 karakter olabilir"),
    city: z
      .string({ message: "Bu alan boş olamaz" })
      .min(2, "Şehir en az 2 karakter olmalıdır")
      .max(50, "Şehir en fazla 50 karakter olabilir"),
    district: z
      .string({ message: "Bu alan boş olamaz" })
      .min(2, "İlçe en az 2 karakter olmalıdır")
      .max(50, "İlçe en fazla 50 karakter olabilir"),
  }),
  cardInfo: z.object({
    cardHolderName: z
      .string({ message: "Bu alan boş olamaz" })
      .min(5, "Kart üzerindeki isim en az 5 karakter olmalıdır")
      .max(100, "Kart üzerindeki isim en fazla 100 karakter olabilir")
      .regex(
        /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/,
        "Kart üzerindeki isim sadece harflerden oluşmalıdır",
      ),
    cardNumber: z
      .string({ message: "Bu alan boş olamaz" })
      .min(1, "Kart numarası zorunludur.")
      .regex(/^\d{4} \d{4} \d{4} \d{4}$/, "Lütfen geçerli bir kart giriniz."),
    expireMonth: z
      .string({ message: "Bu alan boş olamaz" })
      .regex(/^([1-9]|1[0-2])$/, "Geçerli bir ay giriniz (1-12)"),
    expireYear: z
      .string({ message: "Bu alan boş olamaz" })
      .length(4, "Yıl 4 haneli olmalıdır")
      .regex(/^[0-9]+$/, "Yıl sadece rakamlardan oluşmalıdır"),
    cvc: z
      .string({ message: "Bu alan boş olamaz" })
      .length(3, "CVC kodu 3 haneli olmalıdır")
      .regex(/^[0-9]+$/, "CVC kodu sadece rakamlardan oluşmalıdır"),
    threeDsecure: z.boolean().default(false),
  }),
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
export type CheckoutFormValues = z.infer<typeof nonAuthSchema>;

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
    .min(1, { message: "Lütfen bir kod girin" })
    .nullable(),
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
export const idForEverythingUuid = z
  .string({ message: "Bu alan zorunlu" })
  .uuid({ message: "Geçerli bir ID giriniz" });
export type IdForEverythingTypeUuid = z.infer<typeof idForEverythingUuid>;
export const serverEditAddressSchema = addUserServer.extend({
  id: idForEverything,
});

export type ServerEditAddressType = z.infer<typeof serverEditAddressSchema>;
export const CreditCardSchema = z.object({
  cardHolderName: z
    .string({ message: "Bu alan boş olamaz" })
    .min(5, { message: "Kart üzerindeki isim en az 5 karakter olmalıdır" })
    .max(100, {
      message: "Kart üzerindeki isim en fazla 100 karakter olabilir",
    })
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, {
      message: "Kart üzerindeki isim sadece harflerden oluşmalıdır",
    }),

  cardNumber: z
    .string({ message: "Bu alan boş olamaz" })

    .min(1, { message: "Kart numarası zorunludur." })
    .regex(/^\d{4} \d{4} \d{4} \d{4}$/, {
      message: "Lütfen geçerli bir kart giriniz.",
    }),

  expireMonth: z
    .string({ message: "Bu alan boş olamaz" })

    .regex(/^([1-9]|1[0-2])$/, { message: "Geçerli bir ay giriniz (1-12)" }),
  expireYear: z
    .string({ message: "Bu alan boş olamaz" })
    .length(4, { message: "Yıl 4 haneli olmalıdır" })
    .regex(/^[0-9]+$/, { message: "Yıl sadece rakamlardan oluşmalıdır" }),

  cvc: z
    .string({ message: "Bu alan boş olamaz" })
    .length(3, { message: "CVC kodu 3 haneli olmalıdır" })
    .regex(/^[0-9]+$/, { message: "CVC kodu sadece rakamlardan oluşmalıdır" }),
  threeDsecure: z.boolean().default(false),

  privacyAccepted: z
    .boolean()
    .default(false)
    .refine((val) => val === true, {
      message: "Gizlilik sözleşmesi ve satış politikasını kabul etmelisiniz",
    }),
});
export type CreditCardFormValues = z.infer<typeof CreditCardSchema>;

export const variantIdQtyItemSchema = z.object({
  variantId: z
    .string({ message: "Variant ID zorunludur" })
    .uuid({ message: "Geçerli bir variant ID giriniz" }), // UUID formatında olduğu için CUID yerine UUID kullandım
  quantity: z
    .number({ message: "Miktar zorunludur" })
    .int({ message: "Miktar tam sayı olmalıdır" })
    .min(1, { message: "En az 1 adet ürün seçmelisiniz" })
    .max(99, { message: "En fazla 99 adet ürün seçebilirsiniz" }),
});
export type VariantIdQtyItemType = z.infer<typeof variantIdQtyItemSchema>;
export const variantIdQtySchema = z
  .array(variantIdQtyItemSchema)
  .nonempty({ message: "En az 1 ürün seçmelisiniz" })
  .max(10, { message: "En fazla 10 farklı ürün seçebilirsiniz" });
export const refundFormSchema = z.object({
  info: z
    .string({ message: "Bu alan gereklidir" })
    .min(1, { message: "İade nedeni en az 1 karakter olmalıdır" }),
  description: z
    .string({ message: "Bu alan zorunludur" })
    .min(1, { message: "En az 1 karakter olmalıdır" })
    .max(100, { message: "En fazla 100 karakter olabilir" }),
});
export type RefundFormValues = z.infer<typeof refundFormSchema>;
export const refundRequestSchema = z.object({
  orderId: idForEverything,
  info: refundFormSchema.shape.info,
  description: z
    .string({ message: "Bu alan zorunludur" })
    .min(1, { message: "En az 1 karakter olmalıdır" })
    .max(100, { message: "En fazla 100 karakter olabilir" }),
});

export type RefundRequestValues = z.infer<typeof refundRequestSchema>;

export const refundAdminSchema = z.object({
  orderId: idForEverything,
  quantity: z
    .number({ message: "Bu alan zorunludur" })
    .int({ message: "Bu alan zorunludur" })
    .min(1, { message: "En az 1 adet ürün girmelisiniz" }),
  adminNote: z
    .string()
    .max(200, { message: "Not en fazla 200 karakter olabilir" })
    .optional(),
});

export type RefundAdminValues = z.infer<typeof refundAdminSchema>;
export const SalerInfoSchema = z.object({
  storeName: z
    .string({ message: "Bu alan zorunludur." })
    .min(1, { message: "Bu alan zorunludur." })
    .max(50, { message: "Bu alan en fazla 50 karakter olabilir" }),
  storeDescription: z
    .string({ message: "Bu alan zorunludur" })
    .min(1, { message: "Bu alan zorunludur." })
    .max(500, "Açıklama en fazla 500 karakter olabilir"),
  address: z
    .string({ message: "Bu alan zorunludur" })
    .min(1, { message: "Bu alan zorunludur." })
    .max(300, "Adres en fazla 300 karakter olabilir"),
  logo: z
    .array(z.instanceof(File), { message: "Bu alan zorunludur" })
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
    })
    .optional(),
  contactEmail: z
    .string({ message: "Bu alan zorunludur." })
    .email({ message: "Geçerli bir e-posta adresi giriniz" }),
  contactPhone: z
    .string({ message: "Bu alan zorunludur." })
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
  whatsapp: z
    .string()
    .refine(
      (val) =>
        !val ||
        /^\(5([0345])([0-9]|(5[567])|([345])[0-9])\) ([0-9]{3}) ([0-9]{2}) ([0-9]{2})$/.test(
          val,
        ),
      {
        message: "Geçerli bir cep telefon numarası giriniz",
      },
    )
    .optional()
    .nullable(),
  seoTitle: z
    .string({ message: "Bu alan zorunludur." })
    .max(60, "SEO başlığı en fazla 60 karakter olabilir"),
  seoDescription: z
    .string({ message: "Bu alan zorunludur." })
    .max(160, "SEO açıklaması en fazla 160 karakter olabilir"),
  instagram: z
    .string()
    .regex(
      /^[a-zA-Z0-9._]{1,30}$/,
      "Geçerli bir Instagram kullanıcı adı giriniz",
    )
    .optional()
    .nullable(),

  facebook: z
    .string()
    .regex(/^[a-zA-Z0-9.]{1,50}$/, "Geçerli bir Facebook kullanıcı adı giriniz")
    .optional()
    .nullable(),

  pinterest: z
    .string()
    .min(3, "Pinterest kullanıcı adı en az 3 karakter olmalıdır")
    .max(30, "Pinterest kullanıcı adı en fazla 30 karakter olabilir")
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-_.]*$/,
      "Geçerli bir Pinterest kullanıcı adı giriniz",
    )
    .optional()
    .nullable(),

  twitter: z
    .string()
    .max(15, "Twitter kullanıcı adı en fazla 15 karakter olabilir")
    .regex(
      /^[a-zA-Z0-9_]{1,15}$/,
      "Geçerli bir Twitter (X) kullanıcı adı giriniz",
    )
    .optional()
    .nullable(),
});
export type SalerInfoFormValues = z.infer<typeof SalerInfoSchema>;
export const AuthUserPaymentDataSchema = z.object({
  data: CreditCardSchema,
  address: idForEverything,
  discountCode: discountCode.shape.code,
  variantIdQty: z.array(variantIdQtyItemSchema).min(1, {
    message: "En az bir ürün seçmelisiniz",
  }),
});
export type AuthUserPaymentDataType = z.infer<typeof AuthUserPaymentDataSchema>;
export const NonAuthPaymentDataSchema = z.object({
  data: nonAuthSchema,
  variantIdQty: z.array(variantIdQtyItemSchema).min(1, {
    message: "En az bir ürün seçmelisiniz",
  }),
  params: discountCode.shape.code,
});
export type NonAuthPaymentDataType = z.infer<typeof NonAuthPaymentDataSchema>;
export const SocialMediaPreviewSchema = z.object({
  logo: z
    .array(z.instanceof(File), { message: "Bu alan zorunludur" })
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
          "video/mp4",
          "image/jpg",
          "image/webp",
        ];

        if (!SUPPORTED_FORMATS.includes(file.type)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${file.name} geçersiz dosya formatı. Desteklenen formatlar: .jpg, .jpeg, .png, .webp, .gif`,
          });
        }
      });
    })
    .optional(),
  favicon: z
    .array(z.instanceof(File), { message: "Bu alan zorunludur" })
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
          "video/mp4",
          "image/jpg",
          "image/webp",
        ];

        if (!SUPPORTED_FORMATS.includes(file.type)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${file.name} geçersiz dosya formatı. Desteklenen formatlar: .jpg, .jpeg, .png, .webp, .gif`,
          });
        }
      });
    })
    .optional(),
  title: z
    .string({ message: "Bu alan boş olamaz" })
    .min(1, { message: "Bu alan boş olamaz" })
    .max(60, { message: "Başlık en fazla 60 karakter olabilir" }),
  description: z
    .string({ message: "Bu alan boş olamaz" })
    .min(1, { message: "Bu alan boş olamaz" })
    .max(300, { message: "Açıklama en fazla 300 karakter olabilir" }),
  themeColor1: z
    .string({ message: "Bu alan boş olamaz" })
    .min(1, { message: "Bir renk seçmelisiniz" })
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: "Geçerli bir HEX renk kodu girilmelidir (örn: #FF0000)",
    })
    .transform((val) => val.toUpperCase()),
  themeColor2: z
    .string({ message: "Bu alan boş olamaz" })
    .min(1, { message: "Bir renk seçmelisiniz" })
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: "Geçerli bir HEX renk kodu girilmelidir (örn: #FF0000)",
    })
    .transform((val) => val.toUpperCase()),
  googleId: z.string().optional().nullable(),
  googleVerification: z.string().optional().nullable(),
});
export type SocialMediaPreviewType = z.infer<typeof SocialMediaPreviewSchema>;

export const Variants = z
  .object({
    uniqueId: z.string().uuid(),
    value: z.union([
      z.string().trim(),
      z
        .number()
        .min(0, { message: "Ağırlık değeri 0'dan küçük olamaz" })
        .max(Number.MAX_SAFE_INTEGER, { message: "Ağırlık değeri çok büyük" }),
    ]),
    unit: z.enum(["ML", "L", "G", "KG"]).optional().nullable(),
    type: z.enum([VariantType.COLOR, VariantType.WEIGHT, VariantType.SIZE], {
      message: "Geçerli bir varyant tipi seçiniz",
    }),
    isSpotLight: z.boolean().optional().default(false),
    price: z
      .number({ message: "Bu alan boş olamaz" })
      .min(0, { message: "Ürün fiyatı 0'dan küçük olamaz" }),
    discount: z
      .number({ message: "Bu alan boş olamaz" })
      .min(0, { message: "Ürün indirimi 0'dan küçük olamaz" })
      .default(0),
    active: z.boolean({ message: "Bu alan boş olamaz" }).default(true),
    stock: z.number().optional(),
    imageFiles: z
      .array(z.instanceof(File), { message: "Bu alan zorunludur" })
      .optional()
      .superRefine((files, ctx) => {
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
              message: `${file.name} geçersiz dosya formatı. Desteklenen formatlar: .jpg, .jpeg, .png, .webp, .gif`,
            });
          }
        });
      }),
    slug: z.string({ message: "Bu alan boş olamaz" }).trim().optional(),
    pageTitle: z
      .string({ message: "Bu alan boş olamaz" })
      .trim()
      .min(1, { message: "Sayfa başlığı boş olamaz" })
      .max(60, { message: "Sayfa başlığı 60 karakterden uzun olamaz" }),
    metaDescription: z
      .string({ message: "Bu alan boş olamaz" })
      .trim()
      .min(50, { message: "Açıklama en az 50 karakter olmalıdır" })
      .max(160, { message: "Açıklama 160 karakterden uzun olamaz" }),
    richTextDescription: z
      .string()
      .nullable()
      .optional()
      .transform((value) => value?.trim() || value)
      .refine(
        (value) => {
          if (value === null || value === undefined) return true;
          const forbiddenTags = /<script|<iframe|<embed|<object|javascript:/i;
          return !forbiddenTags.test(value);
        },
        {
          message: "İçerik güvenlik kontrolünden geçemedi",
        },
      )
      .refine(
        (value) => {
          if (value === null || value === undefined) return true;
          const strippedContent = value
            .replace(/<[^>]*>/g, "")
            .replace(/&nbsp;/g, " ")
            .trim();
          return strippedContent.length > 0;
        },
        {
          message: "İçerik sadece biçimlendirme içeremez, metin girmelisiniz",
        },
      ),
  })
  .superRefine((data, ctx) => {
    switch (data.type) {
      case VariantType.COLOR: {
        if (typeof data.value !== "string") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Renk değeri metin olmalıdır",
            path: ["value"],
          });
          return;
        }

        if (!data.value.startsWith("#")) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Renk hex kodu # ile başlamalıdır",
            path: ["value"],
          });
          return;
        }

        const hex = data.value.slice(1);
        if (![3, 6].includes(hex.length)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Geçersiz hex kod uzunluğu",
            path: ["value"],
          });
          return;
        }

        if (!/^[0-9A-Fa-f]+$/.test(hex)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Geçersiz hex karakterleri",
            path: ["value"],
          });
        }
        break;
      }

      case VariantType.WEIGHT: {
        if (typeof data.value !== "number") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Ağırlık değeri sayı olmalıdır",
            path: ["value"],
          });
          return;
        }

        if (data.value < 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Ağırlık 0'dan küçük olamaz",
            path: ["value"],
          });
          return;
        }

        if (data.value > Number.MAX_SAFE_INTEGER) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Ağırlık değeri çok büyük",
            path: ["value"],
          });
          return;
        }

        if (!data.unit) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Ağırlık birimi seçilmelidir",
            path: ["unit"],
          });
        }
        break;
      }

      case VariantType.SIZE: {
        if (typeof data.value !== "string") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Beden değeri metin olmalıdır",
            path: ["value"],
          });
          return;
        }

        if (!["XS", "S", "M", "L", "XL", "XXL"].includes(data.value)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Geçersiz beden değeri",
            path: ["value"],
          });
        }
        break;
      }
    }
  });

export type VariantData = z.infer<typeof Variants>;

export const ProductAddSchema = z.object({
  description: z
    .string({ message: "Bu alan zorunludur" })
    .trim() // Trimmed
    .min(1, { message: "Ürün açıklaması zorunludur" }),
  shortDescription: z
    .string({ message: "Bu alan zorunludur" })
    .trim() // Trimmed
    .min(1, { message: "Kısa açıklama zorunludur" }),
  active: z.boolean().default(true),
  googleCategories: z.string().trim().optional(), // Trimmed

  taxPrice: z
    .number({ message: "Bu alan boş olamaz" })
    .min(0, { message: "Vergi fiyatı 0'dan küçük olamaz" })
    .max(Number.MAX_SAFE_INTEGER, { message: "Vergi fiyatı çok yüksek" }),
  name: z
    .string({ message: "Bu alan boş olamaz" })
    .trim() // Trimmed
    .min(1, "Ürün adı en az 1 karakter olmalıdır")
    .max(100, "Ürün adı en fazla 100 karakter olabilir"),
  productType: z
    .enum([ProductType.PHYSICAL, ProductType.DIGITAL], {
      message: "Ürün tipi seçmelisiniz",
    })
    .default(ProductType.PHYSICAL),
  categories: z
    .array(
      z
        .string({ message: "Bu alan zorunludur" })
        .trim() // Trimmed
        .uuid({ message: "Geçersiz kategori ID" }),
    )
    .nonempty({ message: "En az bir kategori seçmelisiniz" }),
  variants: z
    .array(Variants, { message: "Bu alan zorunludur" })
    .min(1, { message: "En az bir varyant eklemelisiniz" })
    .superRefine((data, ctx) => {
      const values = data.map((v) => v.value);
      const valueMap = new Map();

      values.forEach((value, index) => {
        if (valueMap.has(value)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Varyantlar benzersiz değerlere sahip olmalıdır",
            path: [index, "value"], // Hatalı varyantın value'sunu işaret ediyoruz
          });
        }
        valueMap.set(value, index);
      });
    }),
});

export type ProductAddFormValues = z.infer<typeof ProductAddSchema>;
export const CategoryEditableSchema = z.object({
  name: z
    .string({ message: "Bu alan zorunludur" })
    .trim() // Trimmed
    .min(1, { message: "Kategori adı en az 1 karakter olmalıdır" })
    .max(50, { message: "Kategori adı en fazla 50 karakter olabilir" }),
  description: z
    .string({ message: "Bu alan zorunludur" })
    .trim()
    .min(1, { message: "Kategori açıklaması en az 1 karakter olmalıdır" })
    .max(500, {
      message: "Kategori açıklaması en fazla 500 karakter olabilir",
    }),
  active: z.boolean().default(true),
  imageFiles: z
    .array(z.instanceof(File), { message: "Bu alan zorunludur" })
    .optional()
    .superRefine((files, ctx) => {
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
            message: `${file.name} geçersiz dosya formatı. Desteklenen formatlar: .jpg, .jpeg, .png, .webp, .gif`,
          });
        }
      });
    }),
  metaTitle: z
    .string({ message: "Bu alan zorunludur" })
    .min(1, "SEO başlık en az 1 karakter olmalıdır")
    .max(60, "SEO başlık 60 karakterden uzun olamaz"),
  metaDescription: z
    .string({ message: "Bu alan zorunludur" })
    .min(1, "SEO Açıklaması en az 1 karakter olmalıdır")
    .max(160, "SEO açıklama 160 karakterden uzun olamaz"),
  metaKeywords: z
    .string()
    .transform((val) => (val ? val.split(",").filter(Boolean) : []))
    .pipe(z.array(z.string()))
    .transform((val) => val.join(","))
    .optional(),
  googleCategories: z.string({ message: "Bu alan zorunludur" }).trim(),
});
export type CategoryEditableFormValues = z.infer<typeof CategoryEditableSchema>;

export const marquueFormSchema = z.object({
  text: z
    .string()
    .max(100, { message: "En fazla 100 karakter olabilir" })
    .optional(),
  textColor: z
    .string({ message: "Bu alan boş olamaz" })
    .min(1, { message: "Bir renk seçmelisiniz" })
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: "Geçerli bir HEX renk kodu girilmelidir (örn: #FF0000)",
    })
    .transform((val) => val.toUpperCase())
    .optional(),
  textPadding: z.number().optional(),
  bgColor: z.string().optional(),
  fontSize: z.number().optional(),
  slidingSpeed: z.number().optional(),
  isActive: z.boolean().default(true),
  url: z
    .string()
    .optional()
    .refine(
      (url) => {
        // Eğer url undefined veya boş string ise geçerli
        if (!url) return false;

        // Eğer sadece # ise geçerli (boş yönlendirme)
        if (url === "#") return true;

        // Bunun dışındaki tüm değerler / ile başlamalı
        return url.startsWith("/");
      },
      {
        message:
          "URL ya boş yönlendirme için '#' olmalı ya da diğer tüm durumlar için '/' ile başlamalıdır",
      },
    ),
});
export type MarqueeFormValues = z.infer<typeof marquueFormSchema>;
export const NoReplyEmailSettingsSchema = z.object({
  email: z
    .string({ message: "Bu alan zorunludur." })
    .trim()
    .email({ message: "Geçerli bir e-posta adresi giriniz" }),
  password: z
    .string({ message: "Bu alan zorunludur." })
    .trim()
    .min(1, { message: "Bu alan zorunludur." }),
  port: z
    .number({ message: "Bu alan zorunludur." })
    .min(1, { message: "Port numarası 1'den küçük olamaz" }),
  host: z
    .string({ message: "Bu alan zorunludur." })
    .trim()
    .min(1, { message: "Bu alan zorunludur." }),
});
export type NoReplyEmailSettingsType = z.infer<
  typeof NoReplyEmailSettingsSchema
>;
export const EmailTemplateSchema = z.object({
  title: z.string().optional(),
  altText: z.string().optional(),
  showButton: z.boolean().default(false),
  buttonText: z.string().optional(),
});
export type EmailTemplateSchemaType = z.infer<typeof EmailTemplateSchema>;
