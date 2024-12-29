import { CSSProperties, memo, useMemo } from "react";
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { EmailButton, ProductInfo, SalerInfoForEmail } from "../types/type";
import { formattedPrice } from "@/lib/format";

const ProductRenderer = memo(({ products }: { products: ProductInfo[] }) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";
  return products.map((product, index) => (
    <Section key={index} style={{ marginTop: 16, marginBottom: 16 }}>
      <table style={{ width: "100%" }}>
        <tbody style={{ width: "100%" }}>
          <tr style={{ width: "100%" }}>
            <td
              style={{
                width: "50%",
                paddingRight: 32,
                boxSizing: "border-box",
              }}
            >
              <Img
                alt="Braun Vintage"
                style={{
                  borderRadius: 8,
                  width: "100%",
                  objectFit: "cover",
                }}
                height={220}
                src={`${baseUrl}/api/user/asset/get-image?url=${product.url}&width=400&quality=40`}
              />
            </td>
            <td style={{ width: "50%", verticalAlign: "baseline" }}>
              <Text
                style={{
                  margin: "0px",
                  marginTop: 8,
                  fontSize: 20,
                  lineHeight: "28px",
                  fontWeight: 600,
                  color: "rgb(17,24,39)",
                }}
              >
                {product.name} - {product.quantity}x
              </Text>
              <Text
                style={{
                  marginTop: 8,
                  fontSize: 16,
                  lineHeight: "24px",
                  color: "rgb(107,114,128)",
                }}
              >
                {product.description}
              </Text>
              <table style={{ marginTop: "4px", width: "100%" }}>
                <tbody>
                <tr
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <td>
                    <Text
                      style={{
                        fontSize: "18px",
                        fontWeight: 600,
                        lineHeight: "28px",
                        color: "#111827",
                      }}
                    >
                      {formattedPrice(product.price)}
                    </Text>
                  </td>
                  {product.type === "COLOR" && (
                    <td>
                      <table>
                        <tbody>
                        <tr>
                          <td
                            style={{
                              width: "16px",
                              height: "16px",
                              borderRadius: "9999px",
                              backgroundColor: product.value,
                              border: "1px solid #e5e7eb",
                            }}
                          >
                            &nbsp;
                          </td>
                        </tr>
                        </tbody>
                      </table>
                    </td>
                  )}
                  {product.type === "SIZE" && (
                    <td>
                      <Text
                        style={{
                          fontSize: "18px",
                          fontWeight: 600,
                          lineHeight: "28px",
                          color: "#111827",
                        }}
                      >
                        {product.value}
                      </Text>
                    </td>
                  )}
                  {product.type === "WEIGHT" && (
                    <td>
                      <Text
                        style={{
                          fontSize: "18px",
                          fontWeight: 600,
                          lineHeight: "28px",
                          color: "#111827",
                        }}
                      >
                        {product.value} {product.unit}
                      </Text>
                    </td>
                  )}
                </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      <Hr />
    </Section>
  ));
});
ProductRenderer.displayName = 'ProductRenderer';
const TitleTextRenderer = memo(
  ({ title, text }: { title: string; text: string }) => {
    return (
      <Section style={{ margin: "16px 0" }}>
        <Text
          style={{
            fontSize: "24px",
            fontWeight: "700",
            lineHeight: "32px",
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: "16px", // text-md karşılığı
            fontWeight: "600", // font-semibold karşılığı
          }}
        >
          {text}
        </Text>
      </Section>
    );
  },
);
TitleTextRenderer.displayName = 'TitleTextRenderer';

const ButtonRenderer = memo(({ button }: { button: EmailButton }) => {
  const buttonStyle = useMemo(
    (): CSSProperties => ({
      backgroundColor: button.color,
      padding: "12px 24px",
      borderRadius: "6px",
      color: "#ffffff",
      fontWeight: "600",
      fontSize: "16px",
      textDecoration: "none",
      display: "inline-block",
      textAlign: "center" as const, // TypeScript için "as const" ekliyoruz
      margin: "16px 0px",
      border: "none",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      WebkitBorderRadius: "6px",
      lineHeight: 1,
      maxWidth: "100%",
    }),
    [button.color],
  );
  ButtonRenderer.displayName = 'ButtonRenderer';
  return (
    <Section className="text-center">
      <Button href={button.link} style={buttonStyle}>
        <div
          dangerouslySetInnerHTML={{
            __html: `<!--[if mso]>
          <style>
          .button {
            line-height: 100% !important;
          }
          </style>
          <![endif]-->`,
          }}
        />
        {button.text}
      </Button>
    </Section>
  );
});
export function EmailLayout({
  salerInfo,
  altText,
  title,
  products,
  button,
}: {
  salerInfo: SalerInfoForEmail;
  altText: string;
  title: string;
  products?: ProductInfo[];
  button?: EmailButton;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";
  const logoUrl = salerInfo?.logo
    ? `${baseUrl}/api/user/asset/get-image?url=${salerInfo.logo.url}&logo=true`
    : "https://placehold.co/120x42?text=LOGO";
  const contactEmail = salerInfo?.contactEmail || null;
  const contactPhone = salerInfo?.contactPhone || null;
  const storeName = salerInfo?.storeName || null;
  const address = salerInfo?.address || null;
  const socialLinks = {
    pinterest: salerInfo?.pinterest
      ? `https://tr.pinterest.com/${salerInfo.pinterest}`
      : null,
    instagram: salerInfo?.instagram
      ? `https://www.instagram.com/${salerInfo.instagram}`
      : null,
    twitter: salerInfo?.twitter ? `https://x.com/${salerInfo.twitter}` : null,
    facebook: salerInfo?.facebook
      ? `https://www.facebook.com/${salerInfo.facebook}`
      : null,
    whatsapp: salerInfo?.whatsapp
      ? `https://wa.me/+90${salerInfo.whatsapp.replace(/\D/g, "")}`
      : null,
  };
  const socialIcons = {
    facebook: `${baseUrl}/facebook-logo.svg`,
    twitter: `${baseUrl}/twitter-logo.svg`,
    instagram: `${baseUrl}/instagram-logo.svg`,
    whatsapp: `${baseUrl}/whatsapp-logo.svg`,
    pinterest: `${baseUrl}/pinterest-logo.svg`,
  };
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Container className="flex min-h-24 w-full items-center justify-center py-4">
            <Img
              src={logoUrl}
              alt="HEADERLOGO"
              className="mx-auto max-h-20 w-auto object-contain" // w-1/4 yerine w-auto kullanarak aspect ratio'yu koruyoruz
            />
          </Container>
          <TitleTextRenderer title={title} text={altText} />
          {products && <ProductRenderer products={products} />}
          {button && <ButtonRenderer button={button} />}
          <Section className="text-center">
            <table className="w-full">
              <tbody>
              <tr className="w-full">
                <td align="center">
                  {storeName && (
                    <Text className="mt-0.5 text-[16px] font-semibold leading-[20px] text-gray-900">
                      {storeName}
                    </Text>
                  )}
                </td>
              </tr>
              </tbody>
              <tbody>
              <tr>
                <td align="center">
                  <Row className="table-cell h-[40px] w-full align-bottom">
                    {Object.entries(socialLinks).map(
                      ([platform, link]) =>
                        link && (
                          <Column key={platform} className="px-1">
                            <Link href={link}>
                              <Img
                                alt={
                                  platform.charAt(0).toUpperCase() +
                                  platform.slice(1)
                                }
                                src={socialIcons[platform]}
                                className="h-[32px] w-[32px] object-contain"
                              />
                            </Link>
                          </Column>
                        ),
                    )}
                  </Row>
                </td>
              </tr>
              </tbody>
              <tbody>
              <tr>
                <td align="center">
                  {address && (
                    <Text className="my-0.5 text-[16px] font-semibold leading-[20px] text-gray-500">
                      {address}
                    </Text>
                  )}
                  {contactEmail && (
                    <Text className="mb-0 mt-0.5 text-[16px] font-semibold leading-[20px] text-gray-500">
                      {contactEmail && contactEmail}
                    </Text>
                  )}
                  {contactPhone && (
                    <Text className="mb-0 mt-0.5 text-[16px] font-semibold leading-[20px] text-gray-500">
                      {`+90 ${contactPhone}`}
                    </Text>
                  )}
                </td>
              </tr>
              </tbody>
            </table>
          </Section>
        </Body>
      </Tailwind>
    </Html>
  );
}
