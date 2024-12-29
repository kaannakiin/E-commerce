import { calculatePrice } from "@/lib/calculatePrice";
import { prisma } from "@/lib/prisma";
import {
  IdForEverythingType,
  VariantIdQtyItemType,
} from "@/zodschemas/authschema";
import { createHash } from "crypto";
import {
  basketItems,
  CardType,
  GroupedItems,
  itemTransactions,
} from "../types";
import { CancelReason, VariantType } from "@prisma/client";
import { differenceInDays } from "date-fns";
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
    throw error; // Hatayı yukarı fırlat
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
    url: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
    value: string;
    type: VariantType;
    unit?: string;
  }[];
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
        status: "PROCESSING",
        paymentStatus: "SUCCESS",
        paymentDate: new Date(),
      },
    });
    return {
      success: true,
      message: "Sipariş başarıyla güncellendi",
      email: order.user ? order.user.email : order.address.email,
      product: order.OrderItems.map((item) => {
        return {
          name: item.variant.product.name,
          description: item.variant.product.shortDescription,
          price: item.price,
          quantity: item.quantity,
          type: item.variant.type,
          unit: item.variant.unit,
          url: item.variant.Image[0].url,
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
export async function deleteTempatureAdress(id: IdForEverythingType) {
  try {
    if (!id) {
      return false;
    }
    const address = await prisma.address.findUnique({
      where: {
        id,
      },
    });
    if (!address) {
      return false;
    }
    await prisma.address.delete({
      where: {
        id,
      },
    });
    return true;
  } catch (error) {
    throw error;
  }
}
export async function findAndCancelOrder(
  paymentId: string,
  hostReference: string,
  cancelReason: CancelReason,
) {
  try {
    const order = await prisma.order.findUnique({
      where: {
        paymentId,
      },
      include: {
        OrderItems: true,
      },
    });

    if (!order) {
      return false;
    }

    await prisma.order.update({
      where: {
        paymentId: paymentId,
      },
      data: {
        status: "CANCELLED",
        cancelPaymentId: hostReference,
        isCancelled: true,
        cancelReason: cancelReason,
        cancelProcessDate: new Date(),
      },
    });
    return true;
  } catch (error) {
    throw error;
  }
}
export async function findAndRefundOrderItem(
  id: IdForEverythingType,
  refundReason: CancelReason,
) {
  try {
    if (!id) {
      return false;
    }
    const orderItem = await prisma.orderItems.findUnique({
      where: {
        id: id,
      },
    });
    if (!orderItem) {
      return false;
    }
    await prisma.orderItems.update({
      where: {
        id: id,
      },
      data: {
        isRefunded: true,
        refundReason: refundReason,
        refundStatus: "COMPLETED",
      },
    });
  } catch (error) {}
}
