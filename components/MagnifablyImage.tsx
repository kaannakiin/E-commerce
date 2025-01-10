"use client";
import { useState } from "react";
import ReactImageMagnify from "react-image-magnify";
import CustomImage from "./CustomImage";

type MagnifiableImageProps = {
  src: string;
  quality?: number;
  priority?: boolean;
  alt?: string;
  sizes?: string;
  className?: string;
  objectFit?: "cover" | "contain";
  magnifyProps?: {
    enlargedImagePosition?: "beside" | "over";
    enlargedImageContainerClassName?: string;
    lensStyle?: React.CSSProperties;
  };
  onLoad?(): void;
  onError?(): void;
};

const MagnifiableImage = ({
  src,
  quality = 75,
  priority = false,
  alt = "Image",
  sizes = "100vw",
  className = "",
  objectFit = "cover",
  magnifyProps = {
    enlargedImagePosition: "beside",
    enlargedImageContainerClassName: "ml-4",
    lensStyle: { backgroundColor: "rgba(255, 255, 255, .3)" },
  },
  onLoad,
  onError,
}: MagnifiableImageProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [error, setError] = useState(false);

  const handleError = () => {
    setError(true);
    onError?.();
  };

  const safeEncodeURIComponent = (str: string) => {
    return encodeURIComponent(str).replace(
      /[!'()*]/g,
      (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase(),
    );
  };

  const getImageUrl = (width: number, quality: number) => {
    const params = new URLSearchParams({
      width: width.toString(),
      quality: quality.toString(),
      url: safeEncodeURIComponent(src),
    });

    return `/api/user/asset/get-image?${params.toString()}`;
  };

  if (error) {
    return (
      <CustomImage
        src={src}
        quality={quality}
        priority={priority}
        alt={alt}
        sizes={sizes}
        className={className}
        objectFit={objectFit}
        onError={handleError}
      />
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered ? (
        <ReactImageMagnify
          {...{
            smallImage: {
              alt: alt,
              isFluidWidth: true,
              src: getImageUrl(400, quality),
            },
            largeImage: {
              src: getImageUrl(1200, quality),
              width: 1200,
              height: 1200,
            },
            enlargedImagePosition: magnifyProps.enlargedImagePosition,
            enlargedImageContainerClassName:
              magnifyProps.enlargedImageContainerClassName,
            lensStyle: magnifyProps.lensStyle,
          }}
        />
      ) : (
        <CustomImage
          src={src}
          quality={quality}
          priority={priority}
          alt={alt}
          sizes={sizes}
          className={className}
          objectFit={objectFit}
          onLoad={onLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};

export default MagnifiableImage;
