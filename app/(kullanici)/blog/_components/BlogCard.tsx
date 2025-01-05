import CustomImage from "@/components/CustomImage";
import { Badge, Button, Card, CardSection, Divider, Text } from "@mantine/core";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { BlogCardType } from "../page";
import Link from "next/link";
interface BlogCardProps {
  data: BlogCardType;
}
const BlogCard = ({ data }: BlogCardProps) => {
  return (
    <Card withBorder shadow="sm" padding="lg" radius={"md"}>
      <CardSection className="relative h-48" mb={"sm"}>
        <CustomImage src={data.image.url} quality={40} objectFit="cover" />
      </CardSection>
      <Text fw="bold" lineClamp={1}>
        {data.blogTitle}
      </Text>
      <Divider my={"xs"} />
      <div className="h-24 overflow-hidden">
        <Text fw="normal" lineClamp={6} className="min-h-full">
          {data.blogDescription}
        </Text>
      </div>
      <div className="flex items-center justify-between">
        <Button
          radius={"xl"}
          variant="outline"
          color="primary.9"
          component={Link}
          href={`/blog/${data.slug}`}
          autoContrast
        >
          Daha Fazla
        </Button>
        <Badge color="secondary.6" variant="outline" size="lg" autoContrast>
          {format(new Date(data.createdAt), "dd/MM/yyyy", { locale: tr })}
        </Badge>
      </div>
    </Card>
  );
};

export default BlogCard;
