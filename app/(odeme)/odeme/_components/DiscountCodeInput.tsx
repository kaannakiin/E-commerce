import { discountCode, DiscountCodeType } from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, TextInput } from "@mantine/core";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { MdLocalOffer } from "react-icons/md";

const DiscountCodeInput = ({
  success,
  message,
}: {
  success: boolean;
  message?: string;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [code, setCode] = useState(searchParams.get("discountCode") || "");

  useEffect(() => {
    setCode(searchParams.get("discountCode") || "");
  }, [searchParams]);
  const {
    register,
    setError,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<DiscountCodeType>({
    resolver: zodResolver(discountCode),
  });
  const handleApplyCode: SubmitHandler<DiscountCodeType> = async (data) => {
    try {
      const params = new URLSearchParams(searchParams);
      for (const [key, value] of searchParams.entries()) {
        if (key !== "discountCode") {
          params.set(key, value);
        }
      }
      params.set("discountCode", data.code);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    } catch (error) {
      setError("root", {
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
          value={code}
          onChange={(value) => {
            const newValue = value.currentTarget.value.toUpperCase();
            setCode(newValue);
            setValue("code", newValue);
          }}
          placeholder="İndirim kodunuzu giriniz"
          className="flex-1 uppercase"
          error={errors.code?.message}
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
        />
        <Button
          type="submit"
          variant="filled"
          color="primary.4"
          loading={isSubmitting}
          className="whitespace-nowrap"
          disabled={
            success ||
            isSubmitting ||
            !code.trim() ||
            searchParams.get("discountCode") === code ||
            Object.keys(errors).length > 0
          }
          leftSection={success ? <IoCheckmarkCircleOutline size={16} /> : null}
        >
          {success ? "Uygulandı" : "Uygula"}
        </Button>
      </form>
      {message && <div className="text-sm">{message}</div>}
    </div>
  );
};
export default DiscountCodeInput;
