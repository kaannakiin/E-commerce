"use client";

import MyTemplate from "@/emails/MyTemplate";
import { createTemplateProps } from "@/lib/İyzico/helper/helper";
import { emailSchemas, EmailSchemaType } from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import { SimpleGrid } from "@mantine/core";
import { EmailTemplateType } from "@prisma/client";
import { render } from "@react-email/render";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface CustomEmailTemplateFormProps {
  slug: EmailTemplateType;
}

const CustomEmailTemplateForm = ({ slug }: CustomEmailTemplateFormProps) => {
  const [html, setHtml] = useState<string>("");
  const { control, watch } = useForm<EmailSchemaType[typeof slug]>({
    resolver: zodResolver(emailSchemas[slug]),
    defaultValues: {},
  });
  const formValues = watch();

  useEffect(() => {
    const renderEmail = async () => {
      try {
        const props = createTemplateProps(slug);
        const renderedHtml = await render(<MyTemplate {...props} />, {
          pretty: true,
        });
        setHtml(renderedHtml);
      } catch (error) {
        console.error("Email render error:", error);
      }
    };

    renderEmail();
  }, [formValues, slug]);

  return (
    <SimpleGrid cols={2} spacing={"sm"}>
      <div className="w-full">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      <div>{/* //TODO */}</div>
    </SimpleGrid>
  );
};

export default CustomEmailTemplateForm;
