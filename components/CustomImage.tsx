"use client";
import Image from "next/image";
import { useState } from "react";

type CustomImageProps = {
  src: string;
  quality?: number;
  priority?: boolean;
  alt?: string;
  sizes?: string;
  className?: string;
  objectFit?: "cover" | "contain";
  onLoad?(): void;
};

const CustomImage = ({
  src,
  quality = 75,
  priority = false,
  alt = "Image",
  sizes = "100vw",
  className = "",
  objectFit = "cover",
  onLoad,
}: CustomImageProps) => {
  const [loading, setLoading] = useState(true);

  const baseLoader = ({
    width,
    quality,
    src,
  }: {
    width: number;
    quality: number;
    src: string;
  }) => {
    const props = [`width=${width}`, `quality=${quality}`, `url=${src}`].join(
      "&",
    );
    return `/api/user/asset/get-image?${props}`;
  };

  const thumbnailLoader = ({ src }: { src: string }) => {
    return `/api/user/asset/get-image?url=${src}&thumbnail=true`;
  };

  const handleImageLoad = () => {
    setLoading(false);
    onLoad?.();
  };

  const imageClassName = `
    absolute 
    inset-0 
    h-full 
    w-full 
    ${objectFit === "cover" ? "object-cover" : "object-contain"}
    ${className}
  `.trim();

  return (
    <div className="relative h-full w-full">
      {/* Düşük kaliteli thumbnail */}
      <Image
        fill
        src={src}
        alt={alt}
        priority={priority}
        sizes="10px"
        className={` ${imageClassName} ${!loading ? "opacity-0" : "opacity-100"} transition-opacity duration-200 ease-in-out`}
        loader={thumbnailLoader}
      />

      {/* Yüksek kaliteli asıl görsel */}
      <Image
        fill
        src={src}
        alt={alt}
        sizes={sizes}
        quality={quality}
        priority={priority}
        className={` ${imageClassName} ${loading ? "opacity-0" : "opacity-100"} transition-opacity duration-200 ease-in-out`}
        loader={baseLoader}
        onLoad={handleImageLoad}
      />
    </div>
  );
};

export default CustomImage;
