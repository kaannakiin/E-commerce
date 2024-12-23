"use client";
import { AddFavorite } from "@/app/(admin)/admin/urunler/_actions/ProductActions";
import { ActionIcon } from "@mantine/core";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const FavHeart = ({ isFavorited, productId }) => {
  const onClickHeart = async () => {
    await AddFavorite(productId).then(async (res) => {
      if (res.success) {
        setIsFave(!isFave);
      }
      if (res.isMustLogin) {
        await signIn(undefined, {
          redirect: true,
        });
      }
    });
  };
  const [isFave, setIsFave] = useState(isFavorited);

  return (
    <ActionIcon
      onClick={onClickHeart}
      className={`absolute right-0 top-0 z-20 h-11 w-11 rounded-full bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white`}
    >
      {isFave ? (
        <FaHeart className="h-7 w-7 text-xl text-red-500" />
      ) : (
        <FaRegHeart className="h-7 w-7 text-xl text-gray-700 transition-colors duration-300 group-hover:text-red-500" />
      )}
    </ActionIcon>
  );
};

export default FavHeart;
