import { prisma } from "@/lib/prisma";
import { Params } from "@/types/types";
import { cache } from "react";
import EditCategory from "../../_components/EditCategory";
const feedEditCat = cache(async (slug: string) => {
  return await prisma.category.findUnique({
    where: {
      slug,
    },
    select: {
      name: true,
      description: true,
      Image: {
        select: {
          url: true,
        },
      },
      active: true,
    },
  });
});
const page = async (props: { params: Params }) => {
  const params = await props.params;
  const cat = await feedEditCat(params.slug);
  return <EditCategory category={cat} categorySlug={params.slug} />;
};

export default page;
