"use client";
import { ActionIcon, Anchor, Group, Text } from "@mantine/core";
import Link from "next/link";
import { Fragment } from "react";
import {
  RiFacebookCircleFill,
  RiInstagramFill,
  RiPinterestFill,
  RiTwitterXFill,
} from "react-icons/ri";
import CustomImage from "./CustomImage";
import { FooterType } from "./FooterServer";
import classes from "./modules/Footer.module.css";
import { ECommerceAgreements } from "@prisma/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import footerIyzico from "../public/logo_band_colored.svg";
import Image from "next/image";
export function Footer({
  salerInfo,
  isVisible,
  policies,
}: {
  salerInfo: FooterType;
  isVisible: boolean;
  policies: { type: ECommerceAgreements; title: string; slug: string }[];
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const { push } = useRouter();

  const handleAuth = (tab: "giris" | "kayit") => {
    const currentQuery = params.toString();
    const fullPath = `${pathname}${currentQuery ? `?${currentQuery}` : ""}`;
    const encodedCallbackUrl = encodeURIComponent(fullPath);
    push(`/giris?tab=${tab}&callbackUrl=${encodedCallbackUrl}`);
  };
  const agreementLabels: Record<
    ECommerceAgreements,
    { label: string; shortLabel: string }
  > = {
    TERMS_OF_SERVICE: { label: "Kullanım Koşulları", shortLabel: "Koşullar" },
    PRIVACY_POLICY: { label: "Gizlilik Politikası", shortLabel: "Gizlilik" },
    DISTANCE_SALES_AGREEMENT: {
      label: "Mesafeli Satış Sözleşmesi",
      shortLabel: "M.S.S",
    },
    PERSONAL_DATA_PROTECTION: {
      label: "Kişisel Verilerin Korunması",
      shortLabel: "KVK",
    },
    CLARIFICATION_TEXT: { label: "Aydınlatma Metni", shortLabel: "Aydınlatma" },
    EXPLICIT_CONSENT: { label: "Açık Rıza Metni", shortLabel: "Rıza" },
    MEMBERSHIP_AGREEMENT: { label: "Üyelik Sözleşmesi", shortLabel: "Üyelik" },
    SECURE_SHOPPING: { label: "Güvenli Alışveriş", shortLabel: "Güvenli" },
    RETURN_POLICY: { label: "İade Politikası", shortLabel: "İade" },
    PAYMENT_TERMS: { label: "Ödeme Koşulları", shortLabel: "Ödeme" },
  };
  const items = policies.map((policy) => (
    <Anchor
      key={policy.type}
      component={Link}
      href={`/sozlesmeler/${policy.slug}`}
      c="dimmed"
      className={classes.link}
    >
      <span className={classes.linkFull}>
        {agreementLabels[policy.type].label}
      </span>
      <span className={classes.linkShort}>
        {agreementLabels[policy.type].shortLabel}
      </span>
    </Anchor>
  ));

  return (
    <footer className={classes.footer}>
      <div className={classes.inner}>
        <div className={classes.content}>
          {salerInfo?.logo?.url && (
            <div className={classes.logo}>
              <CustomImage
                src={salerInfo.logo.url}
                alt="Footer Logo"
                objectFit="contain"
              />
            </div>
          )}
          <Group className={classes.links} gap={8}>
            {!isVisible && (
              <Fragment>
                <Anchor<"button">
                  c="dimmed"
                  className={classes.link}
                  onClick={() => handleAuth("giris")}
                >
                  Giriş
                </Anchor>
                <Anchor<"button">
                  c="dimmed"
                  className={classes.link}
                  onClick={() => handleAuth("kayit")}
                >
                  Üye Ol
                </Anchor>
              </Fragment>
            )}
            {items}
          </Group>

          <Group gap={8} wrap="nowrap" className={classes.social}>
            {salerInfo?.facebook && (
              <ActionIcon
                component="a"
                href={"https://tr-tr.facebook.com/people/" + salerInfo.facebook}
                target="_blank"
                variant="default"
                size="lg"
                radius="xl"
              >
                <RiFacebookCircleFill
                  size={18}
                  className="hover:text-[#1877F2]"
                />
              </ActionIcon>
            )}
            {salerInfo?.instagram && (
              <ActionIcon
                component="a"
                href={"https://www.instagram.com/" + salerInfo.instagram}
                target="_blank"
                variant="default"
                size="lg"
                radius="xl"
              >
                <RiInstagramFill size={18} className="hover:text-[#E4405F]" />
              </ActionIcon>
            )}
            {salerInfo?.twitter && (
              <ActionIcon
                component="a"
                href={"https://x.com/" + salerInfo.twitter}
                target="_blank"
                variant="default"
                size="lg"
                radius="xl"
              >
                <RiTwitterXFill size={18} className="hover:text-black" />
              </ActionIcon>
            )}
            {salerInfo?.pinterest && (
              <ActionIcon
                component="a"
                href={"https://tr.pinterest.com/" + salerInfo.pinterest}
                target="_blank"
                variant="default"
                size="lg"
                radius="xl"
              >
                <RiPinterestFill size={18} className="hover:text-red-500" />
              </ActionIcon>
            )}
          </Group>
        </div>
      </div>
      <Group justify="space-between" w="100%" px="md" py="xs">
        <Text size="xs" fw={600} c="dimmed">
          © {new Date().getFullYear()}
          {salerInfo?.storeName ? ` ${salerInfo.storeName}` : null}. Tüm Hakları
          Saklıdır.
        </Text>
        <div className="relative h-8 w-64">
          <Image
            src={footerIyzico}
            alt="Footer iyzico image"
            className="h-full w-full min-w-full"
          />
        </div>
      </Group>
    </footer>
  );
}
