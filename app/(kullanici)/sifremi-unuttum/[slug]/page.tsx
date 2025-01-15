import { Params } from "@/types/types";
import React from "react";
import ForgotCheckForm from "../_components/ForgotCheckForm";
import { notFound } from "next/navigation";
import { Metadata } from "next";
export async function generateMetadata(params: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params.params;
  if (!slug) return notFound();
  return {
    title: "Şifremi Unuttum",
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/sifremi-unuttum/${slug}`,
    },
  };
}
const page = async (params: { params: Params }) => {
  const { slug } = await params.params;
  if (!slug) return notFound();
  return <ForgotCheckForm slug={slug} />;
};

export default page;
