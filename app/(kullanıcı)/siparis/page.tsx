import AddToCartButton from "@/components/AddToCartButton";
import CustomImage from "@/components/CustomImage";
import { formattedPrice } from "@/lib/format";
import { getOrderStatusConfig } from "@/lib/helper";
import { prisma } from "@/lib/prisma";
import { Params, SearchParams } from "@/types/types";
import { Card, ScrollArea } from "@mantine/core";
import { OrderStatus } from "@prisma/client";
import { addDays, format } from "date-fns";
import { tr } from "date-fns/locale";
import { notFound, redirect } from "next/navigation";
import CancelOrderButton from "./_components/CancelOrderButton";
import ReturnOrderButton from "./_components/ReturnOrderButton";
import { auth, signIn } from "@/auth";

const page = async (props: { params: Params; searchParams: SearchParams }) => {
  const searchParams = await props.searchParams;
  const status = searchParams.status as string;
  const orderNumber = searchParams.orderNumber as string;
  const order = await prisma.order.findUnique({
    where: {
      orderNumber,
    },
    select: {
      orderNumber: true,
      orderStatus: true,
      paymentStatus: true,
      id: true,
      paymentId: true,
      ip: true,
      paidPrice: true,
      currency: true,
      user: {
        select: {
          name: true,
          surname: true,
        },
      },
      address: {
        select: {
          addressDetail: true,
          addressTitle: true,
          city: true,
          district: true,
          name: true,
          phone: true,
          surname: true,
          email: true,
        },
      },
      discountCode: {
        select: {
          code: true,
          discountAmount: true,
          discountType: true,
        },
      },
      createdAt: true,
      orderItems: {
        select: {
          price: true,
          currency: true,
          paidPrice: true,
          quantity: true,
          variant: {
            include: {
              product: true,
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
  });
  if (!order || status !== "basarili") {
    return notFound();
  }
  if (order.user !== null) {
    const session = await auth();
    if (!session) {
      await signIn(undefined, {
        redirectTo: `/hesabim/siparislerim/${order.orderNumber}`,
      });
    }
    redirect(`/hesabim/siparislerim/${order.orderNumber}`);
  }
  const statusConfig = getOrderStatusConfig(order.orderStatus);
  return (
    <div className="flex flex-col px-2 py-5 lg:px-10">
      <div className="flex w-full flex-row justify-between py-5">
        <div className="flex w-full flex-col gap-2">
          <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
            Sipariş Özetiniz
          </h1>
          <h6 className="text-lg font-semibold text-gray-800 lg:text-xl">
            Sipariş Numarası:{" "}
            <span className="font-mono">{order.orderNumber}</span>
          </h6>
          {order.orderStatus !== OrderStatus.CANCELLED && (
            <h6 className="text-base italic text-gray-600 lg:text-lg">
              Bizi tercih ettiğiniz için teşekkür ederiz.
            </h6>
          )}
          {order.orderStatus === OrderStatus.CANCELLED && (
            <h6 className="text-base italic text-red-500 lg:text-lg">
              Siparişiniz iptal edilmiştir.
            </h6>
          )}
        </div>
        <div className="flex items-end">
          <CancelOrderButton
            paymentId={order.paymentId}
            ip={order.ip}
            createdAt={order.createdAt}
            orderStatus={order.orderStatus}
            paymentStatus={order.paymentStatus}
          />

          {/* <ReturnOrderButton
            createdAt={order.createdAt}
            orderStatus={order.orderStatus}
            orderId={order.id}
          /> */}
        </div>
      </div>
      <div className="flex w-full flex-col gap-3 lg:h-[400px] lg:flex-row lg:gap-5">
        <Card
          radius="md"
          padding="md"
          shadow="sm"
          withBorder
          className="lg:h-full lg:w-1/4"
        >
          <div className="space-y-4">
            <h1 className="border-b pb-3 text-2xl font-semibold text-gray-800">
              Sipariş Bilgileri
            </h1>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Sipariş Tarihi:</span>
                <span className="font-medium">
                  {format(new Date(order.createdAt), "MMM d, yyyy HH:mm", {
                    locale: tr,
                  })}
                </span>
              </div>

              {order.orderStatus !== OrderStatus.CANCELLED && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tahmini Teslim:</span>
                  <span className="font-medium">
                    {format(
                      addDays(new Date(order.createdAt), 3),
                      "MMMM d yyyy",
                      {
                        locale: tr,
                      },
                    )}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Sipariş Durumu:</span>
                <span
                  className="rounded-full px-3 py-1 text-sm font-bold"
                  style={{
                    backgroundColor: `${statusConfig.color}15`, // %15 opaklık
                    color: statusConfig.color,
                  }}
                >
                  {statusConfig.text}
                </span>
              </div>

              {order.discountCode ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Toplam Tutar:</span>
                    <span className="text-lg font-medium text-gray-800">
                      {formattedPrice(
                        order.orderItems.reduce(
                          (a, b) => a + b.price * b.quantity,
                          0,
                        ),
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t pt-3">
                    <span className="text-gray-600">İndirim Tutarı:</span>
                    <span className="text-lg font-medium text-red-500">
                      -
                      {order.discountCode.discountType === "PERCENTAGE"
                        ? `${formattedPrice(
                            (order.orderItems.reduce((a, b) => a + b.price, 0) *
                              order.discountCode.discountAmount) /
                              100,
                          )}`
                        : formattedPrice(order.discountCode.discountAmount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t pt-3">
                    <span className="text-gray-600">Ödenen Tutar:</span>
                    <span className="text-xl font-bold text-green-600">
                      {formattedPrice(order.paidPrice)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-gray-600">Ödenen Tutar:</span>
                  <span className="text-xl font-bold text-green-600">
                    {formattedPrice(order.paidPrice)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>
        <Card
          radius="md"
          padding="md"
          shadow="sm"
          withBorder
          className="lg:h-full lg:w-1/4"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <h1 className="text-2xl font-semibold text-gray-800">
                Fatura ve Teslimat Adresi
              </h1>
            </div>

            <div className="space-y-4 rounded-lg p-4">
              <div className="grid grid-cols-1 gap-3">
                {order.address.addressTitle && (
                  <div className="flex flex-col">
                    <span className="mb-1 text-sm text-gray-600">
                      Adres Başlığı
                    </span>
                    <span className="font-medium text-gray-800">
                      {order.address.addressTitle}
                    </span>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="mb-1 text-sm text-gray-600">Email </span>
                  <span className="font-medium text-gray-800">
                    {order.address.email}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="mb-1 text-sm text-gray-600">Adres</span>
                  <span className="font-medium text-gray-800">
                    {order.address.city} / {order.address.district}
                    {order.address.addressDetail}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="mb-1 text-sm text-gray-600">Ad-Soyad</span>
                  <span className="font-medium text-gray-800">
                    {order.address.name.charAt(0).toUpperCase() +
                      order.address.name.slice(1).toLowerCase()}{" "}
                    {order.address.surname.charAt(0).toUpperCase() +
                      order.address.surname.slice(1).toLowerCase()}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="mb-1 text-sm text-gray-600">Telefon</span>
                  <span className="font-medium text-gray-800">
                    {order.address.phone}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
        <ScrollArea className="w-full flex-1 lg:h-full">
          <Card
            radius="md"
            padding="lg"
            shadow="sm"
            withBorder
            className="min-w-full"
          >
            <div className="space-y-6">
              <h1 className="border-b pb-4 text-xl font-semibold text-gray-800 lg:text-2xl">
                Sipariş Ürünleri
              </h1>
              {order.orderItems.map((item, index) => (
                <div
                  key={index}
                  className="group flex flex-col items-start justify-between gap-6 border-b border-gray-100 py-6 transition-all duration-200 hover:bg-gray-50/50 lg:flex-row lg:items-center"
                >
                  {/* Ürün Görseli ve Bilgileri */}
                  <div className="flex w-full items-center gap-6 lg:w-auto">
                    {/* Ürün Görseli */}
                    <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-white p-2 transition-all duration-200 group-hover:border-gray-200 group-hover:shadow-sm">
                      <CustomImage
                        src={item.variant.Image[0]?.url}
                        quality={20}
                        objectFit="contain"
                        className="mix-blend-multiply transition-transform duration-200 group-hover:scale-105"
                      />
                    </div>

                    {/* Ürün Bilgileri */}
                    <div className="flex flex-col gap-2.5">
                      <span className="font-medium tracking-tight text-gray-900 lg:text-lg">
                        {item.variant.product.name}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-700 transition-colors group-hover:bg-gray-200">
                          {item.quantity}x
                        </span>
                        <span className="text-sm text-gray-500 lg:text-base">
                          {formattedPrice(item.price)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full flex-col-reverse gap-4 lg:w-auto lg:flex-row lg:items-center lg:gap-6">
                    <div className="w-full lg:w-auto">
                      <AddToCartButton
                        variant={item.variant}
                        repeatBuy={true}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </ScrollArea>
      </div>
    </div>
  );
};

export default page;
