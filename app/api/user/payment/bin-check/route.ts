import { iyzico } from "@/lib/iyzicoClient";
import { generateNon3DSignature } from "@/lib/IyzicoHelper";
import { NextRequest, NextResponse } from "next/server";

interface BinErrorResponse {
  status: "failure";
  errorCode: string;
  errorMessage: string;
  errorGroup: string;
  locale: string;
  systemTime: number;
  conversationId: string;
}

export async function POST(req: NextRequest) {
  try {
    const { binNumber } = await req.json();
    const conversationId = `BIN_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    if (!binNumber || binNumber.length < 6) {
      return NextResponse.json(
        {
          status: "failure",
          errorCode: "INVALID_BIN",
          errorMessage: "Geçerli bir BIN numarası giriniz",
          errorGroup: "VALIDATION_ERROR",
          locale: "tr",
          systemTime: Date.now(),
          conversationId,
        } as BinErrorResponse,
        { status: 400 },
      );
    }

    const response = await iyzico.checkBin(binNumber, conversationId);
    if (response.conversationId !== conversationId) {
      const mismatchError: BinErrorResponse = {
        status: "failure",
        errorCode: "CONVERSATION_ID_MISMATCH",
        errorMessage: "Yanıt doğrulanamadı",
        errorGroup: "SECURITY_ERROR",
        locale: "tr",
        systemTime: Date.now(),
        conversationId,
      };
      console.error("Conversation ID mismatch", {
        sent: conversationId,
        received: response.conversationId,
      });
      return NextResponse.json(mismatchError, { status: 400 });
    }

    if (response.status === "failure") {
      return NextResponse.json(response, { status: 400 });
    }

    return NextResponse.json(response, {
      status: response.cardType === "DEBIT_CARD" ? 201 : 200,
    });
  } catch (error) {
    const conversationId = `ERROR_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const errorResponse: BinErrorResponse = {
      status: "failure",
      errorCode: "SYSTEM_ERROR",
      errorMessage: "Beklenmedik bir hata oluştu",
      errorGroup: "SYSTEM_ERROR",
      locale: "tr",
      systemTime: Date.now(),
      conversationId,
    };

    console.error("Bin Check Error:", error);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
