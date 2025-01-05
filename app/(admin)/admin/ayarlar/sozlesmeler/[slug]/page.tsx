import { prisma } from "@/lib/prisma";
import { Params } from "@/types/types";
import { notFound } from "next/navigation";
import React, { cache } from "react";
import PolicyForm from "../_components/PolicyForm";
import { Prisma } from "@prisma/client";
export type FormDbDefaultValues = Prisma.PoliciesGetPayload<{
  select: {
    content: true;
    title: true;
    type: true;
    id: true;
  };
}>;
const feedPage = cache(async (slug: string) => {
  try {
    const policy = await prisma.policies.findUnique({
      where: { id: slug },
      select: {
        title: true,
        content: true,
        type: true,
        id: true,
      },
    });
    if (!policy) return notFound();
    return policy;
  } catch (error) {
    console.error("Feed Page Error:", error);
    return notFound();
  }
});
const EditPolicyForm = async (params: { params: Params }) => {
  const slug = (await params.params).slug;
  const data = await feedPage(slug);
  return (
    <div className="p-10">
      <PolicyForm defaultValues={data} />
    </div>
  );
};

export default EditPolicyForm;
