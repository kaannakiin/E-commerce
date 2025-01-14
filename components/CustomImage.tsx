"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

type CustomImageProps = {
  src: string;
  quality?: number;
  priority?: boolean;
  alt?: string;
  sizes?: string;
  className?: string;
  objectFit?: "cover" | "contain";
  richText?: boolean;
  onLoad?(): void;
  onError?(): void;
};

const CustomImage = ({
  src,
  quality = 80, // NewRecordAsset'teki varsayılan değer ile eşleştirildi
  priority = false,
  alt = "Image",
  sizes = "100vw",
  className = "",
  objectFit = "cover",
  richText = false,
  onLoad,
  onError,
}: CustomImageProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setImgSrc(src);
  }, [src]);

  const safeEncodeURIComponent = (str: string) => {
    return encodeURIComponent(str).replace(
      /[!'()*]/g,
      (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase(),
    );
  };

  const baseLoader = ({
    width,
    quality,
    src,
  }: {
    width: number;
    quality: number;
    src: string;
  }) => {
    const params = new URLSearchParams({
      url: safeEncodeURIComponent(src),
      width: width.toString(),
      quality: quality.toString(),
    });

    if (richText) {
      params.append("richText", "true");
    }

    return `/api/user/asset/get-image?${params.toString()}`;
  };

  const thumbnailLoader = ({ src }: { src: string }) => {
    const params = new URLSearchParams({
      url: safeEncodeURIComponent(src),
      thumbnail: "true",
    });

    if (richText) {
      params.append("richText", "true");
    }

    return `/api/user/asset/get-image?${params.toString()}`;
  };

  const handleImageLoad = () => {
    setLoading(false);
    onLoad?.();
  };

  const handleImageError = () => {
    setError(true);
    setLoading(false);
    onError?.();
  };

  const imageClassName = twMerge(
    "absolute inset-0 h-full w-full bg-white",
    objectFit === "cover" ? "object-cover" : "object-contain",
    className,
  );

  if (error) {
    return (
      <div className="relative flex h-full w-full items-center justify-center bg-gray-100">
        <span className="text-gray-400">Image not available</span>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-gray-50">
      {loading && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
      )}

      {/* Thumbnail image'ı sadece richText false ise göster */}
      {!error && !richText && (
        <Image
          fill
          src={imgSrc}
          alt={alt}
          priority={priority}
          sizes="10px"
          className={twMerge(
            imageClassName,
            "transition-opacity duration-200 ease-in-out",
            !loading ? "opacity-0" : "opacity-100",
          )}
          loader={thumbnailLoader}
          onError={handleImageError}
        />
      )}

      {!error && (
        <Image
          fill
          src={imgSrc}
          alt={alt}
          sizes={sizes}
          quality={quality}
          priority={priority}
          className={twMerge(
            imageClassName,
            "transition-opacity duration-200 ease-in-out",
            loading ? "opacity-0" : "opacity-100",
          )}
          loader={baseLoader}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
    </div>
  );
};

export default CustomImage;
