export interface BinInquiryResponse {
  bankName: string;
  bankId: string;
  cardType: "DEBIT" | "CREDIT";
  cardOrg: "VISA" | "MASTERCARD" | "TROY" | "AMEX";
  commercial: boolean;
  rewardType: "BONUS" | "AXESS" | "CHIP" | "WORLD" | string;
  success: boolean;
  systemTime: string; // ISO DateTime string
  correlationId: string;
  errorCode?: string; // Optional çünkü sadece success false olduğunda dönüyor
  errorMessage?: string; // Optional çünkü sadece success false olduğunda dönüyor
  securityHash: string;
}
export interface PaymentRequest {
  orderId: string; // (2-36)
  amount: number; // decimal
  currency: string; // 3 chars
  installmentCount: number;
  paymentGroup: string;
  paymentChannel?:
    | "WEB"
    | "MOBILE"
    | "MOBILE_WEB"
    | "MOBILE_IOS"
    | "MOBILE_ANDROID"
    | "MOBILE_WINDOWS"
    | "MOBILE_TABLET"
    | "MOBILE_PHONE";
  callbackUrl?: string;
  card: {
    cvv: string;
    expireMonth: number; // 1-12
    expireYear: number; // 4 digits
    holderName: string; // max 30
    number: string; // 5-35
  };
  billingAddress?: {
    address: string; // max 400
    emailAddress?: string;
    city?: string; // max 30
    companyName?: string; // max 100
    country?: string; // max 50
    contactName?: string; // max 30
    zipCode?: string; // max 15
    district?: string; // max 50
    phoneNumber?: string;
  };
  shippingAddress?: {
    address: string; // max 400
    emailAddress?: string;
    city?: string; // max 30
    companyName?: string; // max 100
    country?: string; // max 50
    contactName?: string; // max 30
    zipCode?: string; // max 15
    district?: string; // max 50
    phoneNumber?: string;
  };
  buyer: {
    ipAddress: string;
    buyerId: string; // max 50
    name: string; // max 30
    surName: string; // max 30
    identityNumber?: string; // 11 chars
    city?: string; // max 50
    country?: string; // max 50
    emailAddress: string;
    phoneNumber: string;
    registrationAddress?: string; // max 400
    zipCode?: string; // max 15
    registrationDate?: Date;
    lastLoginDate?: Date;
  };
  basket?: {
    basketId?: string; // max 50
    basketItems?: Array<{
      itemId: string; // max 50
      itemType: "PHYSICAL" | "VIRTUAL";
      name: string; // max 50
      category?: string; // max 50
      subCategory?: string; // max 100
      unitPrice?: number; // min 0.0
      totalPrice: number; // min 0.0
      numberOfProducts?: number; // 1-99999
    }>;
  };
  securityHash?: string;
}
export interface PaymentResponse {
  success: string; // "true" veya "false"
  systemTime: string; // DateTime
  correlationId: string; // İşlem numarası
  orderId: string; // Sipariş numarası
  amount: number; // İşlem tutarı
  currency: string; // Para birimi
  card: {
    binNumber: string; // İlk 8 hane
    maskedNumber: string; // Maskeli kart no
    cardBrand: string; // Kart markası
    cardOrganization: string; // Kart organizasyonu
    cardType: string; // Kart tipi
  };
  threeDSHtmlContent?: string; // Base64 decode edilecek HTML
  errorCode?: string; // Hata kodu
  errorMessage?: string; // Hata mesajı
  securityHash: string; // Doğrulama hash'i
}
