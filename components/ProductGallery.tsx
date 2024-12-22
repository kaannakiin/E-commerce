"use client";
import { useState } from "react";
import CustomImage from "./CustomImage";

const ProductGallery = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {/* Ana resim gösterimi */}
      <div className="relative aspect-[11/7] w-full overflow-hidden rounded-lg">
        <CustomImage
          src={images[selectedImage]}
          quality={80}
          objectFit="cover"
        />
      </div>

      {/* Thumbnail listesi */}
      <div className="grid grid-cols-4 gap-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`relative aspect-[7/4] overflow-hidden rounded-lg ${
              selectedImage === index
                ? "ring-2 ring-blue-500"
                : "ring-1 ring-gray-200"
            } transition-all duration-200 hover:ring-blue-300`}
          >
            <CustomImage src={image} quality={21} objectFit="cover" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;
