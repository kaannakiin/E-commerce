import { calculatePrice } from "@/lib/calculatePrice";
import { prisma } from "@/lib/prisma";
import { VariantIdQtyItemType } from "@/zodschemas/authschema";

export async function FindProducts(
  productIds: VariantIdQtyItemType[],
): Promise<{
  status: boolean;
  message: string;
  data?;
}> {
  try {
    if (productIds.length === 0) {
      return { status: false, message: "No products" };
    }

    const result = await prisma.$transaction(async (tx) => {
      const products = await tx.variant.findMany({
        where: {
          id: {
            in: productIds.map((item) => item.variantId),
          },
        },
        include: {
          product: {
            include: {
              categories: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return products.map((product) => ({
        id: product.id,
        name: product.product.name + " " + product.type,
        itemType: "PHYSICAL",
        category: product.product.categories[0].name,
        unitPrice: calculatePrice(
          product.price,
          product.discount,
          product.product.taxRate,
        ).finalPrice,
        totalPrice:
          calculatePrice(
            product.price,
            product.discount,
            product.product.taxRate,
          ).finalPrice *
          productIds.find((p) => p.variantId === product.id)?.quantity,
        numberOfProducts:
          productIds.find((p) => p.variantId === product.id)?.quantity || 0,
      }));
    });

    return { status: true, message: "Success", data: result };
  } catch (error) {
    return;
  }
}
