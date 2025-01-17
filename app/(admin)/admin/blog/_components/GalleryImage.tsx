"use client";
import CustomImage from "@/components/CustomImage";
import { FC } from "react";
import { BiCheck, BiSolidTrash } from "react-icons/bi";

interface Props {
  secureUrl: string;
  onDeleteClick?(): void;
  onSelectClick?(): void;
}

const GalleryImage: FC<Props> = ({
  secureUrl,
  onDeleteClick,
  onSelectClick,
}) => {
  return (
    <div className="group relative aspect-square w-full overflow-hidden rounded">
      <CustomImage src={secureUrl} richText alt="Resim" quality={40} />
      <div className="absolute bottom-0 left-0 right-0 hidden group-hover:flex">
        <button
          onClick={onDeleteClick}
          className="flex flex-1 items-center justify-center bg-red-400 p-2 text-white"
        >
          <BiSolidTrash />
        </button>
        <button
          onClick={onSelectClick}
          className="flex flex-1 items-center justify-center bg-blue-400 p-2 text-white"
        >
          <BiCheck />
        </button>
      </div>
    </div>
  );
};

export default GalleryImage;
