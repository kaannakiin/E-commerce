import { Params, SearchParams } from "@/types/types";
import FeedProductList from "../_components/FeedProductList";

const AdminProducts = async (props: {
  searchParams: SearchParams;
  params: Params;
}) => {
  return <FeedProductList {...props} />;
};

export default AdminProducts;
