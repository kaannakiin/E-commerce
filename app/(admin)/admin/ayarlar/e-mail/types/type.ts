import { Prisma, VariantType } from "@prisma/client";

export enum EmailTemplateTypeForUI {
  ORDER_CANCELLED = "ORDER_CANCELLED",
  ORDER_CREATED = "ORDER_CREATED",
  ORDER_INVOICE = "ORDER_INVOICE",
  ORDER_DELIVERED = "ORDER_DELIVERED",
  SHIPPING_CREATED = "SHIPPING_CREATED",
  SHIPPING_DELIVERED = "SHIPPING_DELIVERED",
  ORDER_REFUNDED = "ORDER_REFUNDED",
  REFUND_REQUESTED = "REFUND_REQUESTED",
  REFUND_REJECTED = "REFUND_REJECTED",
  PASSWORD_RESET = "PASSWORD_RESET",
  WELCOME_MESSAGE = "WELCOME_MESSAGE",
}

interface BaseEmailTemplate {
  title: string;
  altText: string;
}

interface BaseEmailTemplateWithProduct extends BaseEmailTemplate {
  product: ProductInfo[];
}

interface BaseEmailTemplateWithButton extends BaseEmailTemplate {
  button: EmailButton;
}

export interface OrderCancelledTemplate extends BaseEmailTemplateWithProduct {
  type: EmailTemplateTypeForUI.ORDER_CANCELLED;
}

export interface OrderCreatedTemplate extends BaseEmailTemplateWithProduct {
  type: EmailTemplateTypeForUI.ORDER_CREATED;
}

export interface OrderInvoiceTemplate extends BaseEmailTemplate {
  type: EmailTemplateTypeForUI.ORDER_INVOICE;
}

export interface OrderDeliveredTemplate extends BaseEmailTemplateWithProduct {
  type: EmailTemplateTypeForUI.ORDER_DELIVERED;
}

export interface ShippingCreatedTemplate extends BaseEmailTemplateWithProduct {
  type: EmailTemplateTypeForUI.SHIPPING_CREATED;
}

export interface ShippingDeliveredTemplate extends BaseEmailTemplate {
  type: EmailTemplateTypeForUI.SHIPPING_DELIVERED;
}

export interface OrderRefundedTemplate extends BaseEmailTemplateWithProduct {
  type: EmailTemplateTypeForUI.ORDER_REFUNDED;
}

export interface RefundRequestedTemplate extends BaseEmailTemplateWithProduct {
  type: EmailTemplateTypeForUI.REFUND_REQUESTED;
}

export interface RefundRejectedTemplate extends BaseEmailTemplateWithProduct {
  type: EmailTemplateTypeForUI.REFUND_REJECTED;
}

export interface PasswordResetTemplate extends BaseEmailTemplateWithButton {
  type: EmailTemplateTypeForUI.PASSWORD_RESET;
}

export interface WelcomeMessageTemplate extends BaseEmailTemplate {
  type: EmailTemplateTypeForUI.WELCOME_MESSAGE;
}

export interface ProductInfo {
  url: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  value: string;
  type: VariantType;
  unit?: string;
}

export type EmailButton = {
  text: string;
  link: string;
  color: string;
};

export type CustomEmailType =
  | OrderCancelledTemplate
  | OrderCreatedTemplate
  | OrderInvoiceTemplate
  | OrderDeliveredTemplate
  | ShippingCreatedTemplate
  | ShippingDeliveredTemplate
  | OrderRefundedTemplate
  | RefundRequestedTemplate
  | RefundRejectedTemplate
  | PasswordResetTemplate
  | WelcomeMessageTemplate;

export type SalerInfoForEmail = Prisma.SalerInfoGetPayload<{
  select: {
    logo: {
      select: {
        url: true;
      };
    };
    contactEmail: true;
    contactPhone: true;
    pinterest: true;
    instagram: true;
    twitter: true;
    facebook: true;
    storeName: true;
    whatsapp: true;
    address: true;
  };
} | null>;
