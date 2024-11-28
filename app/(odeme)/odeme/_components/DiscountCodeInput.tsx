import React, { useState } from "react";
import { TextInput, Button } from "@mantine/core";
import { MdLocalOffer } from "react-icons/md";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { DiscountCheck } from "@/actions/user/discount-check";
import { useStore } from "@/store/store";
import { discountCode, DiscountCodeType } from "@/zodschemas/authschema";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const DiscountCodeInput = () => {
  const items = useStore((state) => state.items);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const {
    register,
    setError,
    handleSubmit,
    setValue,
    formState: { isSubmitting, isSubmitSuccessful },
  } = useForm<DiscountCodeType>({
    resolver: zodResolver(discountCode),
    defaultValues: {
      code: "",
    },
  });
  const handleApplyCode: SubmitHandler<DiscountCodeType> = async (data) => {
    try {
      await DiscountCheck(
        data.code,
        items.map((item) => item.variantId),
      ).then((res) => {
        if (res.success) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("discountCode", data.code);
          router.replace(`${pathname}?${params.toString()}`);
        } else {
          setError("code", {
            message: res.message,
          });
        }
      });
    } catch (error) {
      setError("code", {
        message: "Beklenmedik bir hata oluştu",
      });
    }
  };

  return (
    <div className="space-y-2 border-t border-gray-600 py-3">
      <div className="flex items-center gap-2 text-sm text-gray-300">
        <MdLocalOffer size={16} />
        <span>İndirim Kodu</span>
      </div>
      <form className="flex gap-2" onSubmit={handleSubmit(handleApplyCode)}>
        <TextInput
          {...register("code")}
          onChange={(value) => {
            setValue("code", value.currentTarget.value.toUpperCase());
          }}
          value={searchParams.get("discountCode")}
          placeholder="İndirim kodunuzu giriniz"
          className="flex-1 uppercase"
          styles={{
            input: {
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "white",
              "&::placeholder": {
                color: "rgba(255, 255, 255, 0.5)",
              },
              "&:focus": {
                borderColor: "#228be6",
              },
            },
          }}
        />{" "}
        <Button
          //   onClick={handleApplyCode}
          type="submit"
          variant="filled"
          loading={isSubmitting}
          className="whitespace-nowrap"
          disabled={searchParams.get("discountCode") !== null}
          leftSection={
            searchParams.get("discountCode") !== null ? (
              <IoCheckmarkCircleOutline size={16} />
            ) : null
          }
        >
          {searchParams.get("discountCode") !== null ? "Uygulandı" : "Uygula"}
        </Button>
      </form>
    </div>
  );
};
export default DiscountCodeInput;
