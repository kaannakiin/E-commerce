export interface BinResponse {
  status: string;
  locale: string;
  systemTime: number;
  conversationId: string;
  binNumber: string;
  cardType: string;
  cardAssociation: string;
  cardFamily: string;
  bankName: string;
  bankCode: number;
  commercial: number;
  errorMessage?: string;
}
export interface paymentRequest {
  paymentChannel: string;
  paymentGroup: string;
  locale: string;
  callbackUrl?: string;
  price: number;
  paidPrice: number;
  buyer: {
    id: string;
    name: string;
    surname: string;
    identityNumber: string;
    email: string;
    registrationAddress: string;
    city: string;
    country: string;
    ip: string;
  };
  shippingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
  };
  billingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
  };
  basketItems: basketItems[];
  paymentCard: {
    cardHolderName: string;
    cardNumber: string;
    expireMonth: string;
    expireYear: string;
    cvc: string;
  };
}
export interface basketItems {
  id: string;
  price: string;
  name: string;
  category1: string;
  itemType: "PHYSICAL";
}
interface convertedPayout {
  paidPrice: number;
  iyziCommissionRateAmount: number;
  iyziCommissionFee: number;
  blockageRateAmountMerchant: number;
  blockageRateAmountSubMerchant: number;
  subMerchantPayoutAmount: number;
  merchantPayoutAmount: number;
  iyziConversionRate: number;
  iyziConversionRateAmount: number;
  currency: "TRY";
}
export interface GroupedItems {
  itemId: string;
  quantity: number;
  unitPrice: number;
  unitPriceForMerchant: number;
  paymentTransactionId: string;
}
export interface CardType {
  cardType: string;
  cardAssociation: string;
  cardFamily: string;
  maskedCardNumber: string;
}
export interface itemTransactions {
  itemId: string;
  paymentTransactionId: string;
  transactionStatus: number;
  price: number;
  paidPrice: number;
  merchantCommissionRate: number;
  merchantCommissionRateAmount: number;
  iyziCommissionFee: number;
  iyziCommissionRateAmount: number;
  blockageRate: number;
  blockageRateAmountMerchant: number;
  blockageRateAmountSubMerchant: number;
  blockageResolvedDate: string;
  subMerchantPrice: number;
  subMerchantPayoutRate: number;
  subMerchantPayoutAmount: number;
  merchantPayoutAmount: number;
  convertedPayout: convertedPayout;
}

export interface ErrorPaymentResponse {
  status: "failure";
  errorCode: string;
  errorMessage: string;
  errorGroup: string;
  locale: "tr";
  systemTime: number;
}
export interface SuccessPaymentResponse {
  status: "success";
  locale: "tr";
  systemTime: number;
  price: number;
  paidPrice: number;
  installment: number;
  paymentId: string;
  fraudStatus: number;
  merchantCommissionRate: number;
  merchantCommissionRateAmount: number;
  iyziCommissionFee: number;
  iyziCommissionRateAmount: number;
  cardType: string;
  cardAssociation: string;
  cardFamily: string;
  binNumber: string;
  lastFourDigits: string;
  currency: "TRT";
  itemTransactions: itemTransactions[];
}
export interface Check3D {
  paymentId: string;
  locale: string;
}
export interface Success3DPaymentResponse {
  status: "success" | "failure";
  locale: "tr";
  systemTime: number;
  currency: string;
  paymentid: number;
  conversationId?: string;
  threeDSHtmlContent: string;
  paymentId: string;
  signature: string;
  errorCode?: string;
  errorMessage?: string;
  errorGroup?: string;
  cancelHostReference?: string;
}
interface IyzicoRefundSuccessResponse {
  status: "success";
  locale: string;
  systemTime: number;
  conversationId: string;
  paymentId: string;
  paymentTransactionId: string;
  price: number;
  currency: string;
  authCode: string;
  hostReference: string;
  refundHostReference: string;
  retryable: boolean;
}

// Hatalı response için tip
interface IyzicoRefundErrorResponse {
  status: "failure";
  errorCode: string;
  errorMessage: string;
  locale: string;
  systemTime: number;
  conversationId: string;
  paymentTransactionId: string;
  price: number;
  retryable: boolean;
}

// Union type ile birleştirilmiş genel response tipi
export type IyzicoRefundResponse =
  | IyzicoRefundSuccessResponse
  | IyzicoRefundErrorResponse;
