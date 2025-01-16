import { Params } from "@/types/types";
import { Card } from "@mantine/core";
import { EmailTemplateType } from "@prisma/client";
import CustomEmailTemplateForm from "./_components/CustomEmailTemplateForm";

const EmailtSettingsWithType = async ({ params }: { params: Params }) => {
  const slug = (await params).slug as EmailTemplateType;

  return (
    <div className="flex min-h-screen w-full p-10">
      <Card withBorder radius="md" className="flex-1 p-5">
        <CustomEmailTemplateForm slug={slug} />
      </Card>
    </div>
  );
};

export default EmailtSettingsWithType;
