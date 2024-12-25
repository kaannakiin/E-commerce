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
      className={`absolute right-0 top-0 z-20 h-11 w-11`}
      variant="transparent"
      size={"input-xl"}
    >
      {isFave ? (
        <FaHeart className="text-4xl font-bold text-primary-500" />
      ) : (
        <FaRegHeart className="text-4xl font-bold text-secondary-600 group-hover:text-primary-500" />
      )}
    </ActionIcon>
  );
};

export default FavHeart;
