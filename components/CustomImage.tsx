"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { twMerge } from "tailwind-merge"; // className'leri daha iyi yönetmek için

type CustomImageProps = {
  src: string;
  quality?: number;
  priority?: boolean;
  alt?: string;
  sizes?: string;
  className?: string;
  objectFit?: "cover" | "contain";
  onLoad?(): void;
  onError?(): void;
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
  onError,
}: CustomImageProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

  // src değiştiğinde state'i resetle
  useEffect(() => {
    setLoading(true);
    setError(false);
    setImgSrc(src);
  }, [src]);

  // Image loader'ları için URL parametrelerini güvenli hale getir
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
      width: width.toString(),
      quality: quality.toString(),
      url: safeEncodeURIComponent(src),
    });

    return `/api/user/asset/get-image?${params.toString()}`;
  };

  const thumbnailLoader = ({ src }: { src: string }) => {
    const params = new URLSearchParams({
      url: safeEncodeURIComponent(src),
      thumbnail: "true",
    });

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

  // Base className'leri birleştir
  const imageClassName = twMerge(
    "absolute inset-0 h-full w-full",
    objectFit === "cover" ? "object-cover" : "object-contain",
    className,
  );

  // Fallback gösterimi için
  if (error) {
    return (
      <div className="relative flex h-full w-full items-center justify-center bg-gray-100">
        <span className="text-gray-400">Image not available</span>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-gray-50">
      {/* Blur placeholder */}
      {loading && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
      )}

      {/* Düşük kaliteli thumbnail */}
      {!error && (
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

      {/* Yüksek kaliteli asıl görsel */}
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
