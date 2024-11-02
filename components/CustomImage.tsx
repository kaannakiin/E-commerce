import Image from "next/image";
import { useState } from "react";

const CustomImage = ({ src, quality }) => {
  const loader = ({
    width,
    quality,
    src,
  }: {
    width: number;
    quality: number;
    src: string;
  }) => {
    const props = [`width=${width}`, `quality=${quality}`, `url=${src}`].join(
      "&"
    );
    return `http://localhost:3000/api/user/image/get-image?${props}`;
  };
  const [loading, setLoading] = useState(true);
  return (
    <div className=" w-full h-full">
      <Image
        sizes="10px"
        fill
        priority
        alt="Thumbnail"
        src={src}
        className="object-contain h-full w-full"
        loader={({ src }) =>
          `http://localhost:3000/api/user/image/get-image?url=${src}&thumbnail=true`
        }
      />
      <Image
        fill
        sizes="100vw"
        alt="Thumbnail"
        quality={quality}
        className={`object-contain h-full w-full transition-opacity duration-150 ease-in-out ${
          loading ? "opacity-0" : "opacity-100"
        }`}
        src={src}
        loader={loader}
        onLoad={() => setLoading(false)}
      />
    </div>
  );
};

export default CustomImage;
