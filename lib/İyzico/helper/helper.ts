import { calculatePrice } from "@/lib/calculatePrice";
import { prisma } from "@/lib/prisma";
import {
  IdForEverythingType,
  VariantIdQtyItemType,
} from "@/zodschemas/authschema";
import { EmailTemplateType, VariantType } from "@prisma/client";
import { createHash, timingSafeEqual } from "crypto";
import { differenceInDays } from "date-fns";
import {
  basketItems,
  CardType,
  GroupedItems,
  itemTransactions,
} from "../types";
import { render } from "@react-email/render";
import {
  ButtonTemplateProps,
  MyTemplateProps,
  ProductTemplateProps,
  SimpleTemplateProps,
} from "@/emails/MyTemplate";
export const isWithinRefundPeriod = (paymentDate: Date) => {
  const REFUND_PERIOD_DAYS = 14; // or whatever your refund policy states
  const daysSincePayment = differenceInDays(new Date(), paymentDate);
  return daysSincePayment <= REFUND_PERIOD_DAYS;
};
export async function findProductForIyzico(
  data: VariantIdQtyItemType[],
): Promise<{ status: number; message?: string; data?: basketItems[] }> {
  try {
    if (!data || data.length === 0) {
      return {
        status: 400,
        message: "Ürün listesi boş olamaz",
      };
    }
    const invalidQuantities = data.filter((item) => item.quantity <= 0);
    if (invalidQuantities.length > 0) {
      return {
        status: 400,
        message: "Ürün miktarları 0'dan büyük olmalıdır",
      };
    }
    const products = await prisma.variant.findMany({
      where: {
        id: {
          in: data.map((item) => item.variantId),
        },
        softDelete: false,
      },
      select: {
        id: true,
        isPublished: true,
        price: true,
        discount: true,
        product: {
          select: {
            name: true,
            taxRate: true,
            categories: {
              take: 1,
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Bulunamayan ürünleri tespit et
    const foundProductIds = products.map((product) => product.id);
    const missingProducts = data.filter(
      (item) => !foundProductIds.includes(item.variantId),
    );
    const isPublishedProducts = products.filter(
      (product) => product.isPublished === false,
    );
    if (isPublishedProducts.length > 0) {
      return {
        status: 400,
        message: `Şu ürünler yayında değil: ${isPublishedProducts.map((p) => p.id).join(", ")}`,
      };
    }
    if (missingProducts.length > 0) {
      return {
        status: 400,
        message: `Şu ürünler bulunamadı: ${missingProducts.map((p) => p.variantId).join(", ")}`,
      };
    }

    // Quantity Map oluştur
    const quantityMap = Object.fromEntries(
      data.map((item) => [item.variantId, item.quantity]),
    );

    const deneme = products.flatMap((product) => {
      const quantity = quantityMap[product.id];
      const item: basketItems = {
        id: product.id,
        name: product.product.name,
        price: calculatePrice(
          product.price,
          product.discount,
          product.product.taxRate,
        ).finalPrice.toFixed(2),
        category1: product.product.categories[0].name,
        itemType: "PHYSICAL",
      };

      return Array(quantity).fill(item);
    });
    return { status: 200, data: deneme };
  } catch (error) {
    return { status: 500 };
  }
}
export async function findAddressForIyzıco(address: IdForEverythingType) {
  try {
    if (!address) {
      return {
        status: 400,
        message: "Adres bilgisi boş olamaz",
      };
    }
    const fullAddress = await prisma.address.findUnique({
      where: {
        id: address,
        isDeleted: false,
      },
      select: {
        addressDetail: true,
        city: true,
        district: true,
        email: true,
        name: true,
        phone: true,
        surname: true,
      },
    });
    if (!fullAddress) {
      return {
        status: 404,
        message: "Adres bulunamadı",
      };
    }
    return {
      status: 200,
      city: fullAddress.city,
      district: fullAddress.district,
      registrationAddress:
        fullAddress.addressDetail +
        " " +
        fullAddress.city +
        "/" +
        fullAddress.district,
      shippingAddress: {
        city: fullAddress.city,
        address:
          fullAddress.addressDetail +
          " " +
          fullAddress.city +
          "/" +
          fullAddress.district,
        country: "Türkiye",
        contactName: fullAddress.name + " " + fullAddress.surname,
      },
      billingAddress: {
        city: fullAddress.city,

        address:
          fullAddress.addressDetail +
          " " +
          fullAddress.city +
          "/" +
          fullAddress.district,
        country: "Türkiye",
        contactName: fullAddress.name + " " + fullAddress.surname,
      },
    };
  } catch (error) {
    return { status: 500 };
  }
}
export async function findUserByIdForIyzico(id: IdForEverythingType) {
  try {
    if (!id) {
      return {
        status: 400,
        message: "Kullanıcı bilgisi boş olamaz",
      };
    }
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        phone: true,
      },
    });
    if (!user) {
      return {
        status: 404,
        message: "Kullanıcı bulunamadı",
      };
    }
    return {
      status: 200,
      user: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        phone: user.phone,
        identityNumber: "11111111111",
      },
    };
  } catch (error) {
    return { status: 500 };
  }
}
export async function groupedItemTransactions(
  itemTransactions: itemTransactions[],
): Promise<GroupedItems[]> {
  const groupedItems = itemTransactions.reduce((acc, item) => {
    if (!acc[item.itemId]) {
      acc[item.itemId] = {
        itemId: item.itemId,
        quantity: 0,
        paymentTransactionId: item.paymentTransactionId,
        unitPrice: item.paidPrice,
        unitPriceForMerchant: parseFloat(item.merchantPayoutAmount.toFixed(2)),
      };
    }
    acc[item.itemId].quantity++;
    return acc;
  }, {});

  return Object.values(groupedItems);
}
export async function AuthUserCreateOrder({
  userId,
  addressId,
  items,
  discountCode,
  paymentId,
  cardType,
  ip,
}: {
  userId?: IdForEverythingType;
  addressId: IdForEverythingType;
  items: GroupedItems[];
  discountCode: string;
  paymentId: string;
  cardType: CardType;
  ip: string;
}) {
  try {
    const totalPrice = parseFloat(
      items
        .reduce((acc, item) => acc + item.quantity * item.unitPrice, 0)
        .toFixed(2),
    );
    const totalPriceForMerchant = parseFloat(
      items
        .reduce(
          (acc, item) => acc + item.quantity * item.unitPriceForMerchant,
          0,
        )
        .toFixed(2),
    );
    const orderNumber = await prisma.$transaction(async (tx) => {
      const orderData = await tx.order.create({
        data: {
          ip: ip,
          orderNumber: generateOrderNumber(),
          cardAssociation: cardType.cardAssociation,
          cardFamily: cardType.cardFamily,
          cardType: cardType.cardType,
          maskedCardNumber: cardType.maskedCardNumber,
          paymentId,
          address: {
            connect: {
              id: addressId,
            },
          },
          priceIyzico: totalPriceForMerchant,
          total: totalPrice,
          ...(userId && {
            user: {
              connect: {
                id: userId,
              },
            },
          }),
          ...(discountCode && {
            discountCode: {
              connect: {
                code: discountCode,
              },
            },
          }),

          OrderItems: {
            createMany: {
              data: items.map((item) => ({
                variantId: item.itemId,
                quantity: item.quantity,
                paymentTransactionId: item.paymentTransactionId,
                price: parseFloat(item.unitPrice.toFixed(2)),
                iyzicoPrice: parseFloat(item.unitPriceForMerchant.toFixed(2)),
              })),
            },
          },
        },
      });
      return orderData.orderNumber;
    });
    return orderNumber;
  } catch (error) {
    console.error("Order creation error:", error);
    throw error;
  }
}
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString();
  const hash = createHash("sha256")
    .update(timestamp + random)
    .digest("hex")
    .substring(0, 8)
    .toUpperCase();
  const date = new Date();
  const prefix = [
    (date.getMonth() + 1).toString().padStart(2, "0"),
    date.getDate().toString().padStart(2, "0"),
  ].join("");
  return `${prefix}${hash}`;
}

export async function findByPaymentIdAndUpdate(paymentId: string): Promise<{
  success: boolean;
  message: string;
  email?: string;
  product?: {
    productImageUrl: string;
    name: string;
    price: number;
    quantity: number;
    value: string;
    type: VariantType;
    unit?: string;
  }[];
  orderNumber?: string;
}> {
  try {
    if (!paymentId) {
      return {
        success: false,
        message: "Payment Id boş olamaz",
      };
    }
    const order = await prisma.order.findUnique({
      where: {
        paymentId: paymentId,
      },
      include: {
        address: true,
        user: true,
        OrderItems: {
          include: {
            variant: { include: { product: true, Image: true } },
          },
        },
      },
    });
    if (!order) {
      return {
        success: false,
        message: "Sipariş bulunamadı",
      };
    }
    await prisma.order.update({
      where: {
        paymentId: paymentId,
      },
      data: {
        paymentStatus: "SUCCESS",
        paymentDate: new Date(),
      },
    });
    return {
      success: true,
      message: "Sipariş başarıyla güncellendi",
      email: order.user ? order.user.email : order.address.email,
      orderNumber: order.orderNumber,
      product: order.OrderItems.map((item) => {
        return {
          name: item.variant.product.name,
          price: item.price,
          quantity: item.quantity,
          type: item.variant.type,
          unit: item.variant.unit,
          productImageUrl: item.variant.Image[0].url,
          value: item.variant.value,
        };
      }),
    };
  } catch (error) {
    throw error;
  }
}
export async function NonAuthUserCreateOrder({
  addressInfo,
  addressId,
  cardType,
  items,
  paymentId,
  discountCode,
  ip,
}: {
  addressInfo?: {
    name: string;
    surname: string;
    email: string;
    phone: string;
    addressDetail: string;
    city: string;
    district: string;
  };
  addressId?: IdForEverythingType;
  items: GroupedItems[];
  discountCode: string;
  paymentId: string;
  ip: string;
  cardType: CardType;
}) {
  try {
    const orderNumber = await prisma.$transaction(async (tx) => {
      const totalPrice = parseFloat(
        items
          .reduce((acc, item) => acc + item.quantity * item.unitPrice, 0)
          .toFixed(2),
      );
      const totalPriceForMerchant = parseFloat(
        items
          .reduce(
            (acc, item) => acc + item.quantity * item.unitPriceForMerchant,
            0,
          )
          .toFixed(2),
      );
      const order = await prisma.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          paymentId,
          cardAssociation: cardType.cardAssociation,
          cardFamily: cardType.cardFamily,
          cardType: cardType.cardType,
          maskedCardNumber: cardType.maskedCardNumber,
          priceIyzico: totalPriceForMerchant,
          total: totalPrice,
          ip,
          ...(addressInfo && {
            address: {
              create: {
                name: addressInfo.name,
                surname: addressInfo.surname,
                email: addressInfo.email,
                phone: addressInfo.phone,
                addressDetail: addressInfo.addressDetail,
                city: addressInfo.city,
                district: addressInfo.district,
              },
            },
          }),
          ...(addressId && {
            address: {
              connect: {
                id: addressId,
              },
            },
          }),
          ...(discountCode && {
            discountCode: {
              connect: {
                code: discountCode,
              },
            },
          }),
          OrderItems: {
            createMany: {
              data: items.map((item) => ({
                variantId: item.itemId,
                quantity: item.quantity,
                price: parseFloat(item.unitPrice.toFixed(2)),
                paymentTransactionId: item.paymentTransactionId,
                iyzicoPrice: parseFloat(item.unitPriceForMerchant.toFixed(2)),
              })),
            },
          },
        },
      });
      return order.orderNumber;
    });
    return orderNumber;
  } catch (error) {
    throw error;
  }
}
export async function createTempatureAddress(addressInfo: {
  name: string;
  surname: string;
  email: string;
  phone: string;
  addressDetail: string;
  city: string;
  district: string;
}) {
  try {
    const address = await prisma.address.create({
      data: {
        name: addressInfo.name,
        surname: addressInfo.surname,
        email: addressInfo.email,
        phone: addressInfo.phone,
        addressDetail: addressInfo.addressDetail,
        city: addressInfo.city,
        district: addressInfo.district,
        temporary: true,
        expiresAt: new Date(Date.now() + 1000 * 60 * 15),
      },
    });
    return address.id;
  } catch (error) {
    throw error;
  }
}
export function CheckSignature(requestSign, signature) {
  if (!requestSign || !signature) {
    return false;
  }
  const isValid = timingSafeEqual(
    Buffer.from(requestSign),
    Buffer.from(signature),
  );
  return isValid;
}

export const createTemplateProps = (
  slug: EmailTemplateType,
): MyTemplateProps => {
  const productTemplateTypes: EmailTemplateType[] = [
    EmailTemplateType.ORDER_CREATED,
    EmailTemplateType.ORDER_CANCELLED,
    EmailTemplateType.ORDER_INVOICE,
    EmailTemplateType.ORDER_DELIVERED,
    EmailTemplateType.ORDER_ACCEPTED,
    EmailTemplateType.ORDER_REFUNDED,
    EmailTemplateType.ORDER_REFUND_REQUESTED,
    EmailTemplateType.ORDER_REFUND_REJECTED,
    EmailTemplateType.ORDER_BANKTRANSFER_ACCEPTED,
    EmailTemplateType.SHIPPING_CREATED,
    EmailTemplateType.SHIPPING_DELIVERED,
  ];

  const buttonTemplateTypes: EmailTemplateType[] = [
    EmailTemplateType.PASSWORD_RESET,
    EmailTemplateType.WELCOME_MESSAGE,
  ];
  const simpleTemplateTypes: EmailTemplateType[] = [
    EmailTemplateType.ORDER_BANKTRANSFER_CREATED,
    EmailTemplateType.ORDER_BANKTRANSFER_REJECTED,
    EmailTemplateType.OTHER,
  ];

  if (productTemplateTypes.includes(slug)) {
    return {
      type: slug as (typeof productTemplateTypes)[number],
      logoUrl: "",
      testMode: true,
      products: [
        {
          productImageUrl: "",
          name: "Test Product",
          quantity: 1,
          type: VariantType.COLOR,
          price: 100,
          value: "#000000",
        },
      ],
    } as ProductTemplateProps;
  }

  if (buttonTemplateTypes.includes(slug)) {
    return {
      type: slug as (typeof buttonTemplateTypes)[number],
      logoUrl: "",
      testMode: true,
      buttonUrl: "/",
    } as ButtonTemplateProps;
  }

  return {
    type: slug as (typeof simpleTemplateTypes)[number],
    logoUrl: "",
    testMode: true,
  } as SimpleTemplateProps;
};
export function createEmailTemplateProps(
  type: EmailTemplateType,
  baseProps: {
    logoUrl: string;
    testMode?: boolean;
    products?: {
      productImageUrl: string;
      name: string;
      quantity: number;
      type: VariantType;
      price: number;
      unit?: string;
      value: string;
    }[];
    buttonUrl?: string;
  },
): MyTemplateProps {
  const {
    logoUrl,
    testMode = false,
    products = [],
    buttonUrl = "",
  } = baseProps;
  const productTemplateTypes: EmailTemplateType[] = [
    EmailTemplateType.ORDER_CREATED,
    EmailTemplateType.ORDER_CANCELLED,
    EmailTemplateType.ORDER_INVOICE,
    EmailTemplateType.ORDER_DELIVERED,
    EmailTemplateType.ORDER_ACCEPTED,
    EmailTemplateType.ORDER_REFUNDED,
    EmailTemplateType.ORDER_REFUND_REQUESTED,
    EmailTemplateType.ORDER_REFUND_REJECTED,
    EmailTemplateType.ORDER_BANKTRANSFER_ACCEPTED,
    EmailTemplateType.SHIPPING_CREATED,
    EmailTemplateType.SHIPPING_DELIVERED,
  ];
  const buttonTemplateTypes: EmailTemplateType[] = [
    EmailTemplateType.PASSWORD_RESET,
    EmailTemplateType.WELCOME_MESSAGE,
  ];
  const simpleTemplateTypes: EmailTemplateType[] = [
    EmailTemplateType.ORDER_BANKTRANSFER_CREATED,
    EmailTemplateType.ORDER_BANKTRANSFER_REJECTED,
    EmailTemplateType.OTHER,
  ];

  switch (true) {
    case productTemplateTypes.includes(type): {
      if (!products.length) {
        throw new Error(`Template type ${type} requires products array`);
      }
      return {
        type: type as ProductTemplateProps["type"],
        logoUrl,
        testMode,
        products,
      } as ProductTemplateProps;
    }
    case buttonTemplateTypes.includes(type): {
      if (!buttonUrl) {
        throw new Error(`Template type ${type} requires buttonUrl`);
      }
      return {
        type: type as ButtonTemplateProps["type"],
        logoUrl,
        testMode,
        buttonUrl,
      } as ButtonTemplateProps;
    }
    case simpleTemplateTypes.includes(type): {
      return {
        type: type as SimpleTemplateProps["type"],
        logoUrl,
        testMode,
      } as SimpleTemplateProps;
    }

    default:
      throw new Error(`Unsupported template type: ${type}`);
  }
}
