"use client";
import AddToCartButton from "@/components/AddToCartButton";
import CustomImage from "@/components/CustomImage";
import { calculatePrice } from "@/lib/calculatePrice";
import { OrderItems } from "../page";
import { formattedPrice } from "@/lib/format";
import ReturnOrderButton from "@/app/(kullanıcı)/siparis/_components/ReturnOrderButton";
import { OrderStatus, paymentStatus } from "@prisma/client";
import { getRefundStatusConfig } from "@/lib/helper";
import { Button, UnstyledButton } from "@mantine/core";
import { CustomModal } from "@/components/CustomModal";
import { useDisclosure } from "@mantine/hooks";
const OrderItemsCard = ({
  order,
  paymentStatus,
  orderStatus,
  deliveredDate,
}: {
  order: OrderItems[];
  paymentStatus: paymentStatus;
  orderStatus: OrderStatus;
  deliveredDate: Date;
}) => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
      {order.map((item, index) => (
        <article
          className="flex flex-col gap-4 rounded-lg border border-gray-100 bg-white p-4 shadow-md transition-all hover:shadow-lg sm:flex-row sm:gap-6 sm:p-6"
          key={index}
        >
          <figure className="relative h-40 w-full overflow-hidden rounded-md sm:h-48 sm:w-40">
            <CustomImage
              quality={22}
              objectFit="contain"
              src={item.variant.Image[0].url}
            />
          </figure>
          <div className="flex flex-1 flex-col justify-between space-y-3 sm:space-y-0">
            <div>
              <h3 className="line-clamp-1 text-base font-semibold text-gray-800 sm:text-lg">
                {item.variant.product.name.charAt(0).toUpperCase() +
                  item.variant.product.name.slice(1).toLowerCase()}
              </h3>
              <p className="line-clamp-2 text-sm text-gray-600">
                {item.variant.product.shortDescription}
              </p>
              <p>
                <span className="text-sm text-gray-600">Adet: </span>
                <span className="text-sm font-bold text-gray-800">
                  {item.quantity}
                </span>
              </p>{" "}
              {item.variant.type === "COLOR" && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Renk:</span>
                  <div
                    className="h-5 w-5 rounded-full border border-gray-200"
                    style={{ backgroundColor: item.variant.value }}
                  />
                </div>
              )}
              {item.variant.type === "SIZE" && (
                <p className="text-sm text-gray-600">
                  Beden:{" "}
                  <span className="font-medium">{item.variant.value}</span>
                </p>
              )}
              {item.variant.type === "WEIGHT" && (
                <p className="text-sm text-gray-600">
                  Ağırlık:{" "}
                  <span className="font-medium">
                    {item.variant.value} {item.variant.unit}
                  </span>
                </p>
              )}
              {item.refundOrderItemsRequest ? (
                <div className="flex flex-row items-center gap-2">
                  <span className="text-sm text-gray-600">İade Durumu: </span>
                  <span
                    className="rounded px-2 py-1 text-sm font-medium"
                    style={{
                      backgroundColor:
                        getRefundStatusConfig(
                          item.refundOrderItemsRequest.status,
                        ).color + "20",
                      color: getRefundStatusConfig(
                        item.refundOrderItemsRequest.status,
                      ).color,
                    }}
                  >
                    {
                      getRefundStatusConfig(item.refundOrderItemsRequest.status)
                        .text
                    }{" "}
                  </span>{" "}
                  {/* {item.refundOrderItemsRequest.status === "PENDING" && (
                    <UnstyledButton onClick={open}>İptal et</UnstyledButton>
                  )} */}
                </div>
              ) : (
                <ReturnOrderButton
                  deliveredDate={deliveredDate}
                  orderId={item.id}
                  createdAt={item.createdAt}
                  orderStatus={orderStatus}
                  paymentStatus={paymentStatus}
                />
              )}
            </div>
            <div className="flex items-center justify-between sm:items-end">
              <p className="text-base font-medium text-primary-600 sm:text-lg">
                {formattedPrice(
                  calculatePrice(
                    item.variant.price,
                    item.variant.discount,
                    item.variant.product.taxRate,
                  ).finalPrice * item.quantity,
                )}
              </p>
              <div className="w-1/3">
                <AddToCartButton variant={item.variant} repeatBuy={true} />
              </div>
            </div>
          </div>
          {/* <CustomModal
            title="İade Talebi"
            size={"md"}
            overlayProps={{
              backgroundOpacity: 0.55,
              blur: 3,
            }}
            isOpen={opened}
            onClose={close}
          >
            <div className="flex flex-col">
              <div className="my-2 text-lg font-medium">
                İadeniz başlatılmıştır. İade talebinizi iptal etmek istediğinize
                emin misiniz?
              </div>
              <div className="mx-auto my-2 flex w-1/2 flex-row items-center justify-between">
                <Button onClick={close}>İptal et</Button>
                <Button>Onayla</Button>
              </div>
            </div>
          </CustomModal> */}
        </article>
      ))}
    </div>
  );
};

export default OrderItemsCard;
