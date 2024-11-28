import { NextResponse } from "next/server";

export function handlingError(errorCode: string) {
  switch (errorCode) {
    case "11":
      return NextResponse.json(
        {
          status: 400,
          message: "Kart numarası hatalı, lütfen kontrol ediniz.",
        },
        { status: 400 },
      );
    case "12":
      return NextResponse.json(
        {
          status: 400,
          message: "Kart numarası hatalı, lütfen kontrol ediniz.",
        },
        { status: 400 },
      );
    case "13":
      return NextResponse.json(
        {
          status: 400,
          message: "Son kullanma ayı hatalı, lütfen kontrol ediniz.",
        },
        { status: 400 },
      );
    case "14":
      return NextResponse.json(
        {
          status: 400,
          message: "Son kullanma yılı hatalı, lütfen kontrol ediniz.",
        },
        { status: 400 },
      );
    case "15":
      return NextResponse.json(
        {
          status: 400,
          message: "Cvc geçersiz, lütfen kontrol ediniz.",
        },
        { status: 400 },
      );
    case "17":
      return NextResponse.json(
        {
          status: 400,
          message:
            "Kartınız son kullanma tarihi geçersizdir, lütfen kontrol ediniz.",
        },
        { status: 400 },
      );
    default:
      return NextResponse.json(
        {
          status: 400,
          message: "Kart bilgilerinizi lütfen kontrol ediniz.",
        },
        { status: 400 },
      );
  }
}
