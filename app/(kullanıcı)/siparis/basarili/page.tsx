import { Params, SearchParams } from "@/types/types";
import React from "react";

const page = async (props: { params: Params; searchParams: SearchParams }) => {
  const params = await props.searchParams;
  return <div>page</div>;
};

export default page;
