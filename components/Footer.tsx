"use client";
import { ActionIcon, Anchor, Group } from "@mantine/core";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Fragment } from "react";
import {
  RiFacebookCircleFill,
  RiInstagramFill,
  RiTwitterXFill,
  RiPinterestFill,
} from "react-icons/ri";
import CustomImage from "./CustomImage";
import { FooterType } from "./FooterServer";
import classes from "./modules/Footer.module.css";

export function Footer({
  salerInfo,
  isVisible,
}: {
  salerInfo: FooterType;
  isVisible: boolean;
}) {
  const contracts = [
    { link: "/", label: "Mesafeli Satış Sözleşmesi", shortLabel: "M.S.S" },
    { link: "/", label: "Üyelik Sözleşmesi", shortLabel: "Üyelik" },
    { link: "/", label: "Gizlilik Politikası", shortLabel: "Gizlilik" },
    { link: "/", label: "İptal ve İade", shortLabel: "İade" },
    { link: "/", label: "KVKK", shortLabel: "KVKK" },
  ];

  const items = contracts.map((link) => (
    <Anchor
      key={link.label}
      component={Link}
      href={link.link}
      c="dimmed"
      className={classes.link}
    >
      <span className={classes.linkFull}>{link.label}</span>
      <span className={classes.linkShort}>{link.shortLabel}</span>
    </Anchor>
  ));

  return (
    <footer className={classes.footer}>
      <div className={classes.inner}>
        {/* Logo */}
        {salerInfo?.logo?.url && (
          <div className={classes.logo}>
            <CustomImage
              src={salerInfo.logo.url}
              alt="Footer Logo"
              objectFit="contain"
            />
          </div>
        )}

        {/* Links */}
        <Group className={classes.links} gap={8}>
          {!isVisible && (
            <Fragment>
              <Anchor<"button">
                c="dimmed"
                className={classes.link}
                onClick={() => signIn(undefined, { callbackUrl: "/" })}
              >
                Giriş
              </Anchor>
              <Anchor<"button">
                c="dimmed"
                className={classes.link}
                onClick={() => signIn(undefined, { callbackUrl: "/" })}
              >
                Üye Ol
              </Anchor>
            </Fragment>
          )}
          {items}
        </Group>

        {/* Social Icons */}
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
          )}{" "}
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
    </footer>
  );
}
