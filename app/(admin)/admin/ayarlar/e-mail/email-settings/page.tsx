import React, { cache } from "react";
import EmailSettingsForm from "../_components/EmailSettingsForm";
import { prisma } from "@/lib/prisma";
const feedPage = cache(async () => {
  try {
    const email = await prisma.noReplyEmailSetting.findFirst();
    return email;
  } catch (error) {
    return null;
  }
});
const EmailSettings = async () => {
  const email = await feedPage();
  return (
    <div className="space-y-4 p-10">
      <EmailSettingsForm data={email} />
    </div>
  );
};

export default EmailSettings;
