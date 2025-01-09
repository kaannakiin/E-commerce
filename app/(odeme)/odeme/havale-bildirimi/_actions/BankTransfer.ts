"use server";

import { DiscountCheck } from "@/actions/user/discount-check";
import { calculatePrice } from "@/lib/calculatePrice";
import { generateOrderNumber } from "@/lib/İyzico/helper/helper";
import { prisma } from "@/lib/prisma";
import {
  BankTransferAddressFormValues,
  BankTransferAddressSchema,
  BankTransferFormValues,
  IdForEverythingType,
  VariantIdQtyItemType,
  variantIdQtySchema,
} from "@/zodschemas/authschema";
import { headers } from "next/headers";
import { ZodError } from "zod";

export async function createBankTransfer({
  data,
  items,
  discountCode,
  addressId,
}: {
  data: BankTransferAddressFormValues;
  items: VariantIdQtyItemType[];
  discountCode?: string;
  addressId?: IdForEverythingType;
}): Promise<{ success: boolean; message: string; orderNumber?: string }> {
  try {
    const header = await headers();
    const ip = header.get("x-forwarded-for") || header.get("x-real-ip");

    variantIdQtySchema.parse(items);
    const variants = await prisma.variant.findMany({
      where: { id: { in: items.map((item) => item.variantId) } },
      select: {
        id: true,
        price: true,
        discount: true,
        softDelete: true,
        stock: true,
        isPublished: true,
        product: {
          select: {
            active: true,
            taxRate: true,
          },
        },
      },
    });
    const invalidVariant = variants.find(
      (variant) =>
        !variant.isPublished ||
        variant.product.active === false ||
        variant.softDelete === true,
    );
    if (invalidVariant) {
      return {
        success: false,
        message: "Bir veya daha fazla ürün stokta yok.",
      };
    }
    const orderItems = variants.map((item) => {
      const quantity = items.find((i) => i.variantId === item.id)?.quantity;
      return {
        variantId: item.id,
        quantity,
        price: calculatePrice(item.price, item.discount, item.product.taxRate)
          .finalPrice,
      };
    });
    const orderNumber = generateOrderNumber();
    const discount = { success: false, discountType: "", discountAmount: 0 };
    if (discountCode) {
      await DiscountCheck(
        discountCode,
        items.map((item) => item.variantId),
      ).then((res) => {
        discount.success = res.success;
        discount.discountType = res.discountType;
        discount.discountAmount = res.discountAmount;
      });
    }
    const price = parseFloat(
      orderItems.reduce((acc, item) => acc + item.price, 0).toFixed(2),
    );
    if (addressId) {
      const address = await prisma.address.findUnique({
        where: { id: addressId },
        include: {
          user: { select: { id: true } },
        },
      });
      if (!address) return { success: false, message: "Adres bulunamadı" };

      await prisma.order.create({
        data: {
          orderNumber: orderNumber,
          paymentId: orderNumber,
          user: { connect: { id: address.user.id } },
          ip,
          total: discount.success
            ? discount.discountType === "FIXED"
              ? price - discount.discountAmount
              : price - (price * discount.discountAmount) / 100
            : price,
          priceIyzico: discount.success
            ? discount.discountType === "FIXED"
              ? price - discount.discountAmount
              : price - (price * discount.discountAmount) / 100
            : price,
          address: { connect: { id: addressId } },
          paymentType: "BANK_TRANSFER",
          ...(discountCode && {
            discountCode: {
              connect: {
                code: discountCode,
              },
            },
          }),
          OrderItems: {
            createMany: {
              data: orderItems.map((item) => {
                return {
                  variantId: item.variantId,
                  quantity: item.quantity,
                  price: item.price,
                  iyzicoPrice: item.price,
                };
              }),
            },
          },
        },
      });
      return { success: true, message: "Başarılı", orderNumber: orderNumber };
    } else {
      const {
        addressDetail,
        city,
        district,
        email,
        firstName,
        lastName,
        phone,
      } = BankTransferAddressSchema.parse(data);
      await prisma.order.create({
        data: {
          orderNumber: orderNumber,
          paymentId: orderNumber,
          ip,
          total: discount.success
            ? discount.discountType === "FIXED"
              ? price - discount.discountAmount
              : price - (price * discount.discountAmount) / 100
            : price,
          priceIyzico: discount.success
            ? discount.discountType === "FIXED"
              ? price - discount.discountAmount
              : price - (price * discount.discountAmount) / 100
            : price,
          paymentType: "BANK_TRANSFER",
          ...(discountCode && {
            discountCode: {
              connect: {
                code: discountCode,
              },
            },
          }),
          address: {
            create: {
              addressDetail: addressDetail,
              city: city,
              district: district,
              name: firstName,
              phone: phone,
              surname: lastName,
              email: email,
            },
          },
          OrderItems: {
            createMany: {
              data: orderItems.map((item) => {
                return {
                  variantId: item.variantId,
                  quantity: item.quantity,
                  price: item.price,
                  iyzicoPrice: item.price,
                };
              }),
            },
          },
        },
      });
      return { success: true, message: "Başarılı", orderNumber: orderNumber };
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: error.errors[0].message,
      };
    }
    console.error("Bank transfer error:", error);
    return {
      success: false,
      message: "İşlem sırasında bir hata oluştu",
    };
  }
}
export async function createBankTransferNotification(
  data: BankTransferFormValues,
  orderNumber: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const order = await prisma.order.findUnique({
      where: {
        orderNumber,
      },
      include: {
        BankTransferNotification: true,
      },
    });
    if (!order) {
      return { success: false, message: "Sipariş bulunamadı" };
    }
    if (order.BankTransferNotification.length === 1) {
      return { success: false, message: "Bildirim zaten yapılmış" };
    }
    await prisma.bankTransferNotification.create({
      data: {
        name: data.transferFirstName,
        surname: data.transferLastName,
        orderNumber: orderNumber,
        transactionTime: data.transferTime,
      },
    });
    return {
      success: true,
      message:
        "Başarıyla havale bildirim oluştu. En geç 24 saat içinde sizi mail ile bilgilendireceğiz.",
    };
  } catch (error) {
    return {
      success: false,
      message: "İşlem sırasında bir hata oluştu",
    };
  }
}
