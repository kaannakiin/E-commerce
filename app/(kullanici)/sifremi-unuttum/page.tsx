import React from "react";
import ForgotForm from "./_components/ForgotForm";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Şifremi Unuttum",

  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/sifremi-unuttum`,
  },
};
const ForgotPassword = () => {
  return <ForgotForm />;
};

export default ForgotPassword;
