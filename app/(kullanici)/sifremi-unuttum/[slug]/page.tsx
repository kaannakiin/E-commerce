import { Params } from "@/types/types";
import React from "react";
import ForgotCheckForm from "../_components/ForgotCheckForm";
import { notFound } from "next/navigation";

const page = async (params: { params: Params }) => {
  const { slug } = await params.params;
  if (!slug) return notFound();
  return <ForgotCheckForm slug={slug} />;
};

export default page;
