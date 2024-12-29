import { deleteAddress } from "@/app/(kullanici)/hesabim/adres-defterim/_actions/AddressActions";
import {
  AuthUserCreateOrder,
  groupedItemTransactions,
  NonAuthUserCreateOrder,
} from "@/lib/İyzico/helper/helper";
import { iyzico } from "@/lib/İyzico/iyzicoClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const mdStatus = data.get("mdStatus") as string;
    const paymentId = data.get("paymentId") as string;
    const addressId = req.nextUrl.searchParams.get("ai");
    const nonAuthAddressId = req.nextUrl.searchParams.get("nai");
    const discountCode = (req.nextUrl.searchParams.get("di") as string) || null;
    const userId = req.nextUrl.searchParams.get("ui");
    const ip = req.nextUrl.searchParams.get("ip");
    const body = {
      paymentId,
      locale: "tr",
    };
    if (mdStatus !== "1") {
      const params = new URLSearchParams({
        tab: "payment",
        status: mdStatus,
      });
      if (
        discountCode &&
        discountCode !== "null" &&
        discountCode.trim().length > 0
      ) {
        params.append("discountCode", discountCode);
      }
      if (nonAuthAddressId) {
        await deleteAddress(nonAuthAddressId);
      }
      return Response.redirect(
        new URL(`/odeme?${params.toString()}`, req.nextUrl.origin),
      );
    }
    const request = await iyzico.check3D(body);
    if (request.status === "success") {
      const items = await groupedItemTransactions(request.itemTransactions);
      const cardType = {
        cardType: request.cardType,
        cardAssociation: request.cardAssociation,
        cardFamily: request.cardFamily,
        maskedCardNumber: `${request.binNumber}******${request.lastFourDigits}`,
      };
      if (addressId) {
        const orderNumber = await AuthUserCreateOrder({
          userId,
          addressId,
          items,
          discountCode,
          paymentId,
          cardType,
          ip,
        });
        return Response.redirect(
          new URL(`/hesabim/siparislerim/${orderNumber}`, req.nextUrl.origin),
        );
      } else {
        const orderNumber = await NonAuthUserCreateOrder({
          addressId: nonAuthAddressId,
          items,
          discountCode,
          paymentId,
          cardType,
          ip,
        });
        return Response.redirect(
          new URL(`/siparis/${orderNumber}`, req.nextUrl.origin),
        );
      }
    }
  } catch (error) {
    return Response.redirect(new URL("/odeme", req.nextUrl.origin));
  }
}
