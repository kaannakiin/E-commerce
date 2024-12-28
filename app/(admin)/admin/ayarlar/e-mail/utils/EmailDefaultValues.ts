import { VariantType } from "@prisma/client";
import {
  EmailButton,
  EmailTemplateTypeForUI,
  ProductInfo,
} from "../types/type";
const sampleProducts: ProductInfo[] = [
  {
    url: "19-12-2024-gywlbbwomdw1u9m9hrczmzqc.webp",
    name: "Classic Cotton T-Shirt",
    description: "Comfortable cotton t-shirt perfect for everyday wear",
    price: 29.99,
    quantity: 50,
    value: "#0000FF",
    type: VariantType.COLOR,
  },
  {
    url: "19-12-2024-gywlbbwomdw1u9m9hrczmzqc.webp",
    name: "Slim Fit Denim Jeans",
    description: "Modern slim fit jeans with stretch comfort",
    price: 79.99,
    quantity: 25,
    value: "L",
    type: VariantType.SIZE,
  },
  {
    url: "19-12-2024-gywlbbwomdw1u9m9hrczmzqc.webp",
    name: "Premium Coffee Beans",
    description: "Freshly roasted Arabica coffee beans",
    price: 15.99,
    quantity: 100,
    value: "500",
    type: VariantType.WEIGHT,
    unit: "g",
  },
];
export const defaultValuesForEmailTemplate = (
  type: EmailTemplateTypeForUI,
): {
  title: string;
  altText: string;
  product?: ProductInfo[];
  button?: EmailButton;
} => {
  switch (type) {
    case EmailTemplateTypeForUI.ORDER_CANCELLED:
      return {
        title: "Siparişiniz iptal edildi",
        altText:
          " numaralı siparişiniz işleminiz iptal edildi. İade işleminiz en kısa sürede tamamlanacaktır",
        product: sampleProducts,
      };

    case EmailTemplateTypeForUI.ORDER_CREATED:
      return {
        title: "Siparişiniz için teşekkür ederiz!",
        altText:
          " numaralı siparişiniz başarıyla oluşturuldu. Siparişinizin durumu hakkında sizi bilgilendireceğiz",
        product: sampleProducts,
      };

    case EmailTemplateTypeForUI.ORDER_INVOICE:
      return {
        title: "Sipariş Faturanız",
        altText:
          " numaralı siparişinize ait fatura bilgileriniz ekte yer almaktadır",
      };

    case EmailTemplateTypeForUI.ORDER_DELIVERED:
      return {
        title: "Siparişiniz Teslim Edildi",
        altText:
          " numaralı siparişiniz teslimat adresinize başarıyla ulaştırıldı. Bizi tercih ettiğiniz için teşekkür ederiz",
        product: sampleProducts,
      };

    case EmailTemplateTypeForUI.SHIPPING_CREATED:
      return {
        title: "Siparişiniz Kargoya Verildi",
        altText:
          " numaralı siparişiniz kargoya teslim edildi. Kargo takip numaranızı kullanarak gönderinizi takip edebilirsiniz",
        product: sampleProducts,
      };

    case EmailTemplateTypeForUI.SHIPPING_DELIVERED:
      return {
        title: "Kargonuz Teslim Edildi",
        altText:
          " numaralı siparişinizin kargosu teslimat adresine ulaştı. Keyifle kullanmanız dileğiyle",
      };

    case EmailTemplateTypeForUI.ORDER_REFUNDED:
      return {
        title: "Sipariş İadesi Tamamlandı",
        altText:
          " numaralı siparişinizin iade işlemi tamamlandı. İade tutarı 3-7 iş günü içinde hesabınıza aktarılacaktır",
        product: sampleProducts,
      };

    case EmailTemplateTypeForUI.REFUND_REQUESTED:
      return {
        title: "İade Talebiniz Alındı",
        altText:
          " numaralı sipariş için iade talebiniz alındı. Talebinizi en kısa sürede değerlendireceğiz",
        product: sampleProducts,
      };

    case EmailTemplateTypeForUI.REFUND_REJECTED:
      return {
        title: "İade Talebiniz Reddedildi",
        altText:
          " numaralı sipariş için iade talebiniz, politikalarımıza uygunluk göstermediği için reddedildi. Detaylı bilgi için müşteri hizmetlerimizle iletişime geçebilirsiniz",
        product: sampleProducts,
      };

    case EmailTemplateTypeForUI.PASSWORD_RESET:
      return {
        title: "Şifre Sıfırlama",
        altText:
          "Hesabınız için şifre sıfırlama talebinde bulundunuz. Güvenliğiniz için bu işlemi siz yapmadıysanız lütfen bizi bilgilendirin",
        button: {
          text: "Şifreyi Sıfırla",
          link: "#",
          color: "#EF4444", // Kırmızı
        },
      };

    case EmailTemplateTypeForUI.WELCOME_MESSAGE:
      return {
        title: "Aramıza Hoş Geldiniz!",
        altText:
          "Üyeliğiniz başarıyla oluşturuldu. Alışverişin keyfini çıkarmak için hemen mağazamızı keşfetmeye başlayabilirsiniz",
        button: {
          text: "Şifreyi Sıfırla",
          link: "#",
          color: "#EF4444",
        },
      };

    default:
      throw new Error(`Unknown email template type: ${type}`);
  }
};
