"use client";

import { DeleteImgToProduct } from "@/actions/admin/products/delete-assets-on-product/delete-image/DeleteImage";
import CustomImage from "@/components/CustomImage";
import "@mantine/carousel/styles.css";
import { Carousel } from "@mantine/carousel";
import { CloseButton } from "@mantine/core";
import { useRouter } from "next/navigation";

const CarouselEditImage = ({ images }) => {
  const router = useRouter();
  return (
    <Carousel
      height={208}
      loop
      withControls={false}
      withIndicators
      classNames={{
        indicator:
          "absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500",
      }}
    >
      {images &&
        images.map((image, index) => (
          <Carousel.Slide key={index}>
            <CloseButton
              className="absolute top-2 right-2 z-10 hover:bg-gray-100/80"
              onClick={async () => {
                await DeleteImgToProduct(image.url).then((res) => {
                  if (res.success) router.refresh();
                });
              }}
            />
            <CustomImage src={image.url} quality={20} />
          </Carousel.Slide>
        ))}
    </Carousel>
  );
};

export default CarouselEditImage;
