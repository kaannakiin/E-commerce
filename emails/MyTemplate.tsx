import { EmailTemplateType, VariantType } from "@prisma/client";
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import React from "react";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

interface Product {
  productImageUrl: string;
  name: string;
  quantity: number;
  type: VariantType;
  price: number;
  unit?: string;
  value: string;
}

interface BaseTemplateProps {
  type: EmailTemplateType;
  testMode?: boolean;
  logoUrl: string;
}

// Props for templates that require products
export interface ProductTemplateProps extends BaseTemplateProps {
  type: Extract<
    EmailTemplateType,
    | "ORDER_CREATED"
    | "ORDER_CANCELLED"
    | "ORDER_INVOICE"
    | "ORDER_DELIVERED"
    | "ORDER_ACCEPTED"
    | "ORDER_REFUNDED"
    | "ORDER_REFUND_REQUESTED"
    | "ORDER_REFUND_REJECTED"
    | "ORDER_BANKTRANSFER_ACCEPTED"
    | "SHIPPING_CREATED"
    | "SHIPPING_DELIVERED"
  >;
  products: Product[];
  buttonUrl?: string;
}

export interface ButtonTemplateProps extends BaseTemplateProps {
  type: Extract<EmailTemplateType, "PASSWORD_RESET" | "WELCOME_MESSAGE">;
  buttonUrl: string;
}

export interface SimpleTemplateProps extends BaseTemplateProps {
  type: Extract<
    EmailTemplateType,
    "ORDER_BANKTRANSFER_CREATED" | "ORDER_BANKTRANSFER_REJECTED" | "OTHER"
  >;
}

export type MyTemplateProps =
  | ProductTemplateProps
  | ButtonTemplateProps
  | SimpleTemplateProps;
interface Product {
  productImageUrl: string;
  name: string;
  quantity: number;
  type: VariantType;
  price: number;
  unit?: string;
  value: string;
}
interface GetProductsProps {
  products: Product[];
  testMode: boolean;
}

function getTemplateContent(type: EmailTemplateType) {
  switch (type) {
    case EmailTemplateType.ORDER_CREATED:
      return {
        title: "Siparişiniz Başarıyla Alındı",
        subtitle: "Değerli Müşterimiz, siparişiniz sistemimize kaydedildi.",
        description:
          "Siparişiniz özenle hazırlanacak ve en kısa sürede kargoya teslim edilecektir. Tüm süreç boyunca sizi bilgilendirmeye devam edeceğiz.",
        buttonText: "Siparişimi Takip Et",
        showProducts: true,
        showButton: true,
      };

    case EmailTemplateType.ORDER_CANCELLED:
      return {
        title: "Sipariş İptaliniz Tamamlandı",
        subtitle: "Değerli Müşterimiz, sipariş iptal talebiniz onaylandı.",
        description:
          "İptal edilen siparişinizin ödeme iadesi 3-7 iş günü içerisinde hesabınıza aktarılacaktır. Herhangi bir sorunuz olursa müşteri hizmetlerimiz size yardımcı olmaktan memnuniyet duyacaktır.",
        buttonText: "İptal Detayları",
        showProducts: true,
        showButton: true,
      };

    case EmailTemplateType.ORDER_INVOICE:
      return {
        title: "Faturanız Hazır",
        subtitle: "Değerli Müşterimiz, sipariş faturanız oluşturuldu.",
        description:
          "Siparişinize ait fatura bilgilerini aşağıda bulabilirsiniz. Faturanızı dilediğiniz zaman hesabınızdan görüntüleyebilir ve indirebilirsiniz.",
        buttonText: "Faturayı İndir",
        showProducts: true,
        showButton: true,
      };

    case EmailTemplateType.ORDER_DELIVERED:
      return {
        title: "Siparişiniz Teslim Edildi",
        subtitle: "Değerli Müşterimiz, siparişiniz başarıyla teslim edildi.",
        description:
          "Ürünlerinizi keyifle kullanmanızı dileriz. Deneyiminizi paylaşmak ve ürünlerimizi değerlendirmek isterseniz, aşağıdaki butonu kullanabilirsiniz. Alışverişiniz için teşekkür ederiz.",
        buttonText: "Değerlendirme Yap",
        showProducts: true,
        showButton: true,
      };

    case EmailTemplateType.ORDER_ACCEPTED:
      return {
        title: "Siparişiniz Onaylandı",
        subtitle: "Değerli Müşterimiz, siparişiniz başarıyla onaylandı.",
        description:
          "Siparişiniz onaylandı ve hazırlık sürecine alındı. Ürünleriniz özenle paketlenecek ve en kısa sürede kargoya teslim edilecektir.",
        buttonText: "Sipariş Durumu",
        showProducts: true,
        showButton: true,
      };

    case EmailTemplateType.ORDER_REFUNDED:
      return {
        title: "İade İşleminiz Tamamlandı",
        subtitle: "Değerli Müşterimiz, iade işleminiz başarıyla sonuçlandı.",
        description:
          "İade tutarı hesabınıza aktarılmıştır. Tutarın kartınıza/hesabınıza yansıma süresi bankanıza göre 3-7 iş günü arasında değişebilir. İşleminizle ilgili detayları aşağıdaki butondan görüntüleyebilirsiniz.",
        buttonText: "İade Detayları",
        showProducts: true,
        showButton: true,
      };

    case EmailTemplateType.ORDER_REFUND_REQUESTED:
      return {
        title: "İade Talebiniz Alındı",
        subtitle: "Değerli Müşterimiz, iade talebiniz sistemimize ulaştı.",
        description:
          "İade talebiniz ekiplerimiz tarafından değerlendiriliyor. En kısa sürede size dönüş yapacağız. İade sürecini aşağıdaki butondan takip edebilirsiniz.",
        buttonText: "İade Durumu",
        showProducts: true,
        showButton: true,
      };

    case EmailTemplateType.ORDER_REFUND_REJECTED:
      return {
        title: "İade Talebiniz Değerlendirildi",
        subtitle:
          "Değerli Müşterimiz, iade talebiniz değerlendirme sonucunda onaylanmamıştır.",
        description:
          "İade talebinizin reddedilme gerekçelerini öğrenmek ve detaylı bilgi almak için müşteri hizmetlerimizle iletişime geçebilirsiniz. Size yardımcı olmaktan memnuniyet duyacağız.",
        buttonText: "İade Detayları",
        showProducts: true,
        showButton: true,
      };

    case EmailTemplateType.ORDER_BANKTRANSFER_CREATED:
      return {
        title: "Ödeme Bildiriminiz Alındı",
        subtitle:
          "Değerli Müşterimiz, havale/EFT bildiriminiz sistemimize ulaştı.",
        description:
          "Ödemeniz kontrol ediliyor. Bu işlem en fazla 24 saat içerisinde tamamlanacaktır. Onay durumunu aşağıdaki butondan takip edebilirsiniz.",
        buttonText: "Ödeme Durumu",
        showProducts: false,
        showButton: true,
      };

    case EmailTemplateType.ORDER_BANKTRANSFER_ACCEPTED:
      return {
        title: "Ödemeniz Onaylandı",
        subtitle: "Değerli Müşterimiz, havale/EFT işleminiz onaylandı.",
        description:
          "Ödemeniz başarıyla alındı. Siparişinizin hazırlık sürecine başlıyoruz. Tüm süreç boyunca sizi bilgilendirmeye devam edeceğiz.",
        buttonText: "Sipariş Durumu",
        showProducts: true,
        showButton: true,
      };

    case EmailTemplateType.ORDER_BANKTRANSFER_REJECTED:
      return {
        title: "Ödeme Kontrolü Tamamlandı",
        subtitle: "Değerli Müşterimiz, ödemeniz doğrulanamadı.",
        description:
          "Havale/EFT işleminiz kontrol edildi ancak bir uyuşmazlık tespit edildi. Lütfen ödeme bilgilerinizi kontrol ederek tekrar deneyiniz veya müşteri hizmetlerimizle iletişime geçiniz.",
        buttonText: "Ödeme Bilgileri",
        showProducts: false,
        showButton: false, // Burada butona gerek yok, müşteri sadece bilgilendirilecek
      };

    case EmailTemplateType.SHIPPING_CREATED:
      return {
        title: "Siparişiniz Yola Çıktı",
        subtitle: "Değerli Müşterimiz, siparişiniz kargoya teslim edildi.",
        description:
          "Siparişiniz özenle hazırlandı ve kargo firmasına teslim edildi. Kargo takip numaranız ile gönderinizi anlık olarak takip edebilirsiniz. Teslimat sürecinde herhangi bir değişiklik olduğunda sizi bilgilendireceğiz.",
        buttonText: "Kargo Takip",
        showProducts: true,
        showButton: true,
      };

    case EmailTemplateType.SHIPPING_DELIVERED:
      return {
        title: "Kargonuz Teslim Edildi",
        subtitle: "Değerli Müşterimiz, siparişiniz adresinize teslim edildi.",
        description:
          "Ürünlerinizi sağlıkla kullanmanızı dileriz. Deneyiminizi paylaşmak için aşağıdaki butonu kullanabilirsiniz. Bizi tercih ettiğiniz için teşekkür ederiz.",
        buttonText: "Değerlendirme Yap",
        showProducts: true,
        showButton: true,
      };

    case EmailTemplateType.PASSWORD_RESET:
      return {
        title: "Şifre Sıfırlama Talebi",
        subtitle: "Değerli Müşterimiz, şifre sıfırlama talebiniz alındı.",
        description:
          "Hesabınızın güvenliği için şifrenizi sıfırlamak üzere bir talep aldık. Yeni şifrenizi oluşturmak için aşağıdaki butona tıklayabilirsiniz. Bu talebi siz yapmadıysanız, lütfen bu e-postayı dikkate almayınız.",
        buttonText: "Şifremi Sıfırla",
        showProducts: false,
        showButton: true,
      };

    case EmailTemplateType.WELCOME_MESSAGE:
      return {
        title: "Aramıza Hoş Geldiniz",
        subtitle: "Değerli Müşterimiz, üyeliğiniz başarıyla oluşturuldu.",
        description:
          "Size özel fırsatlar ve kampanyalardan haberdar olmak için bültenlere kayıt olabilirsiniz. Keyifli alışverişler dileriz!",
        buttonText: "Alışverişe Başla",
        showProducts: false,
        showButton: true,
      };

    case EmailTemplateType.OTHER:
      return {
        title: "Bilgilendirme",
        subtitle: "Değerli Müşterimiz",
        description: "Bilgilendirme mesajınız bulunmaktadır.",
        buttonText: "Detayları Görüntüle",
        showProducts: false,
        showButton: false,
      };
    default:
      return {
        title: "Bilgilendirme",
        subtitle: "Değerli Müşterimiz",
        description: "Bilgilendirme mesajınız bulunmaktadır.",
        buttonText: "Detayları Görüntüle",
        showProducts: false,
        showButton: false,
      };
  }
}
function ProductsSection({ products, testMode }: GetProductsProps) {
  const getProductImage = (product: Product) => {
    if (testMode) return "https://placehold.co/110x110?text=Ürün+Resmi";
    return `${baseUrl}/api/user/asset/get-image?url=${product.productImageUrl}&quality=40&width=110&height=110`;
  };

  const total = products.reduce((sum, product) => {
    return sum + product.price * product.quantity;
  }, 0);
  return (
    <Section className="my-4 rounded-lg border border-solid border-gray-200 p-4 pt-0">
      <table className="mb-4 w-full">
        <thead>
          <tr>
            <th className="border-0 border-b border-solid border-gray-200 py-2">
              &nbsp;
            </th>
            <th
              align="left"
              className="border-0 border-b border-solid border-gray-200 py-2 text-gray-500"
              colSpan={6}
            >
              <Text className="font-semibold">Ürün</Text>
            </th>
            <th
              align="center"
              className="border-0 border-b border-solid border-gray-200 py-2 text-gray-500"
            >
              <Text className="font-semibold">Miktar</Text>
            </th>
            <th
              align="center"
              className="border-0 border-b border-solid border-gray-200 py-2 text-gray-500"
            >
              <Text className="font-semibold">Fiyat</Text>
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={index}>
              <td className="border-0 border-b border-solid border-gray-200 py-2">
                <Img
                  alt={product.name}
                  className="rounded-lg object-cover"
                  height={110}
                  src={getProductImage(product)}
                />
              </td>
              <td
                align="left"
                className="border-0 border-b border-solid border-gray-200 py-2"
                colSpan={6}
              >
                <Container className="flex flex-row items-center justify-between gap-1">
                  <Text>{product.name}</Text>
                  {product.type == "COLOR" && (
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        backgroundColor: product.value,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #e2e8f0",
                      }}
                    />
                  )}

                  {product.type === "WEIGHT" &&
                    `${product.value} ${product.unit}`}
                  {product.type === "SIZE" && `${product.value}`}
                </Container>
              </td>
              <td
                align="center"
                className="border-0 border-b border-solid border-gray-200 py-2"
              >
                <Text>{product.quantity}</Text>
              </td>
              <td
                align="center"
                className="border-0 border-b border-solid border-gray-200 py-2"
              >
                <Text>{product.price.toFixed(2)} TL</Text>
              </td>
            </tr>
          ))}

          {/* Toplam Satırı */}
          <tr>
            <td colSpan={7} className="border-0 py-4"></td>
            <td align="right" className="border-0 py-4 pr-2">
              <Text className="font-semibold">Toplam:</Text>
            </td>
            <td align="center" className="border-0 py-4">
              <Text className="font-semibold text-black">
                {total.toFixed(2)} TL
              </Text>
            </td>
          </tr>
        </tbody>
      </table>
    </Section>
  );
}
function HeaderSection({ url }: { url?: string }) {
  return (
    <Section className="py-1">
      <Link href={baseUrl}>
        <Img
          alt="React Email logo"
          className="h-auto min-h-full w-full object-contain"
          src={url ? url : "https://placehold.co/200x42?text=Logo"}
        />
      </Link>
    </Section>
  );
}

const MyTemplate = (props: MyTemplateProps) => {
  const TEST_CONTENT = {
    headerLogo: "https://placehold.co/200x42?text=Logo",
    products: [
      {
        productImageUrl: "https://placehold.co/110x110?text=Ürün+Resmi",
        name: "Test Ürün - Renk Varyantı",
        type: VariantType.COLOR,
        value: "#FF0000",
        quantity: 1,
        price: 99.99,
      },
      {
        productImageUrl: "https://placehold.co/110x110?text=Ürün+Resmi",
        name: "Test Ürün - Beden Varyantı",
        type: VariantType.SIZE,
        value: "M",
        quantity: 2,
        price: 149.99,
      },
      {
        productImageUrl: "https://placehold.co/110x110?text=Ürün+Resmi",
        name: "Test Ürün - Ağırlık Varyantı",
        type: VariantType.WEIGHT,
        value: "5",
        unit: "KG",
        quantity: 1,
        price: 199.99,
      },
    ],
  };

  const { type, testMode = false, logoUrl } = props;
  const content = getTemplateContent(type);

  const isProductTemplate = (
    templateProps: MyTemplateProps,
  ): templateProps is ProductTemplateProps => {
    const productTypes: EmailTemplateType[] = [
      "ORDER_CREATED",
      "ORDER_CANCELLED",
      "ORDER_INVOICE",
      "ORDER_DELIVERED",
      "ORDER_ACCEPTED",
      "ORDER_REFUNDED",
      "ORDER_REFUND_REQUESTED",
      "ORDER_REFUND_REJECTED",
      "ORDER_BANKTRANSFER_ACCEPTED",
      "SHIPPING_CREATED",
      "SHIPPING_DELIVERED",
    ];
    return productTypes.includes(type);
  };

  let displayProducts: Product[] = [];
  if (isProductTemplate(props)) {
    displayProducts = testMode ? TEST_CONTENT.products : props.products;
  }

  let buttonUrl = logoUrl;
  if ("buttonUrl" in props) {
    buttonUrl = props.buttonUrl;
  }

  return (
    <Html>
      <Head />
      <Preview>{content.title}</Preview>
      <Tailwind>
        <Body>
          <Container>
            <HeaderSection
              url={testMode ? TEST_CONTENT.headerLogo : buttonUrl}
            />
            <Text className="text-[24px] font-semibold leading-[32px] text-indigo-600">
              {content.title}
            </Text>
            <Text className="text-[18px] leading-[24px] text-gray-700">
              {content.subtitle}
            </Text>
            <Text className="text-gray-600">{content.description}</Text>

            {content.showProducts && isProductTemplate(props) && (
              <ProductsSection testMode={testMode} products={displayProducts} />
            )}

            {content.showButton && (
              <Row>
                <Column>
                  <Button
                    className="box-border w-full rounded-[8px] bg-gray-600 px-[12px] py-[12px] text-center font-semibold text-white"
                    href={`${buttonUrl}`}
                  >
                    {content.buttonText}
                  </Button>
                </Column>
              </Row>
            )}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default MyTemplate;
