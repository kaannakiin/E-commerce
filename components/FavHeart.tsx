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
        <FaHeart
          style={{
            fontSize: "2rem", // text-4xl
            fontWeight: 700, // font-bold
          }}
        />
      ) : (
        <FaRegHeart
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            color: "var(--mantine-color-secondary-6)",
          }}
          className="group-hover:text-red-500"
        />
      )}
    </ActionIcon>
  );
};

export default FavHeart;
