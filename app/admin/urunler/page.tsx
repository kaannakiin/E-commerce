import { Params, SearchParams } from "@/types/types";
import FeedProductList from "../AdminComponents/FeedProductList";

const AdminProducts = async (props: {
  searchParams: SearchParams;
  params: Params;
}) => {
  return <FeedProductList {...props} />;
};

export default AdminProducts;
