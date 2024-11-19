import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { cache } from "react";
import OrdersTable from "./_components/OrdersTable";
export type OrderWithItems = Prisma.OrderGetPayload<{
  select: {
    id: true;
    createdAt: true;
    orderNumber: true;
    orderStatus: true;
    paidPrice: true;
    currency: true;
    orderItems: {
      select: {
        price: true;
        quantity: true;
        totalPrice: true;
        variant: {
          select: {
            product: {
              select: {
                name: true;
              };
            };
            Image: {
              select: {
                url: true;
                alt: true;
              };
            };
          };
        };
      };
    };
  };
}>;
export type OrderItems = Prisma.OrderItemsGetPayload<{
  select: {
    price: true;
    quantity: true;
    totalPrice: true;
    variant: {
      select: {
        id: true;
        price: true;
        discount: true;
        isPublished: true;
        product: {
          select: {
            name: true;
            shortDescription: true;
            taxRate: true;
            id: true;
          };
        };
        Image: {
          select: {
            url: true;
            alt: true;
          };
        };
        value: true;
        unit: true;
        type: true;
      };
    };
  };
}>;
const feedPage = cache(async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        Order: {
          include: {
            orderItems: {
              select: {
                price: true,
                quantity: true,
                variant: {
                  select: {
                    stock: true,
                    type: true,
                    unit: true,
                    value: true,
                    Image: {
                      take: 1,
                      select: {
                        url: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        createdAt: true,
        orderNumber: true,
        orderStatus: true,
        paidPrice: true,
        currency: true,
        orderItems: {
          select: {
            price: true,
            quantity: true,
            totalPrice: true,

            variant: {
              select: {
                product: {
                  select: {
                    name: true,
                  },
                },
                Image: {
                  select: {
                    url: true,
                    alt: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return orders;
  } catch (error) {}
});

const OrdersPageForUser = async () => {
  const session = await auth();
  const orders = await feedPage(session.user.email);
  return <OrdersTable orders={orders} />;
};

export default OrdersPageForUser;
