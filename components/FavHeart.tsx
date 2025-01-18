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
      className="h-10 w-10"
      variant={isFave ? "subtle" : "outline"}
      color="dark"
      autoContrast
      radius={"xs"}
    >
      {isFave ? <FaHeart size={24} /> : <FaRegHeart size={24} />}
    </ActionIcon>
  );
};

export default FavHeart;
