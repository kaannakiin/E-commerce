import { Divider } from "@mantine/core";
import BlogForm from "../_components/BlogForm";

const NewPostPage = () => {
  return (
    <div className="w-full px-4 pt-6">
      <h4 className="text-center text-xl font-bold">Yeni Blog Yazısı</h4>
      <Divider my={"md"} />
      <BlogForm />
    </div>
  );
};

export default NewPostPage;
