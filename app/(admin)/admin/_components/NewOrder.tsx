"use client";
import React from "react";
import { ScrollArea, UnstyledButton } from "@mantine/core";
import { BsBox, BsTelephone, BsEnvelope, BsGeoAlt } from "react-icons/bs";
import { formattedPrice } from "@/lib/format";
import Link from "next/link";
import { BsArrowRight } from "react-icons/bs"; // veya
import { HiOutlineArrowRight } from "react-icons/hi";
interface Address {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  district: string;
  addressDetail: string;
  createdAt: string;
}

interface Order {
  _count: {
    orderItems: number;
  };
  address: Address;
  orderNumber: string;
  paidPrice: number;
}

interface NewOrderProps {
  orders: Order[];
}

const NewOrder: React.FC<NewOrderProps> = ({ orders }) => {
  return (
    <div className="rounded-lg bg-white p-2 shadow transition-shadow hover:shadow-lg lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700">
          <BsBox className="h-5 w-5 text-indigo-600" />
          Yeni Siparişler
        </h2>
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-600">
          {orders.length} sipariş
        </span>
      </div>

      <ScrollArea className="h-[calc(100vh-240px)]" type="hover">
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.orderNumber}
              className="rounded-lg border border-gray-100 p-4 hover:border-gray-200"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900">
                    {order.address.name}
                  </span>
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                    {order._count.orderItems} Ürün
                  </span>
                </div>
                <span className="flex flex-col items-end gap-3">
                  <p className="text-lg font-semibold text-gray-900">
                    {formattedPrice(order.paidPrice)}
                  </p>
                  <UnstyledButton
                    component={Link}
                    href={"/admin/siparisler/" + order.orderNumber}
                    className="group flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-700"
                  >
                    Detaya Git
                    <BsArrowRight className="transition-transform group-hover:translate-x-1" />
                  </UnstyledButton>
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <BsTelephone className="h-4 w-4" />
                  {order.address.phone}
                </div>
                <div className="flex items-center gap-2">
                  <BsEnvelope className="h-4 w-4" />
                  {order.address.email}
                </div>
                <div className="flex items-center gap-2">
                  <BsGeoAlt className="h-4 w-4" />
                  {order.address.city}, {order.address.district},{" "}
                  {order.address.addressDetail}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>Sipariş No: {order.orderNumber}</span>
                <time>
                  {new Date(order.address.createdAt).toLocaleDateString(
                    "tr-TR",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      weekday: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </time>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default NewOrder;
