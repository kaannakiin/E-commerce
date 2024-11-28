"use client";
import { Button, Modal, Textarea, Tooltip } from "@mantine/core";
import { FaArrowRotateLeft } from "react-icons/fa6";
import React, { Fragment } from "react";
import { fetchWrapper } from "@/lib/fetchWrapper";
import { useDisclosure } from "@mantine/hooks";
import { CustomModal } from "@/components/CustomModal";
import { SubmitHandler, useForm } from "react-hook-form";
import { refundFormSchema, RefundFormValues } from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
const CancelOrderButton = ({
  paymentId,
  ip,
  isSameDay,
}: {
  paymentId: string;
  ip: string;
  isSameDay: boolean;
}) => {
  const [opened, { open, close }] = useDisclosure(false);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { isSubmitting },
  } = useForm<RefundFormValues>({
    resolver: zodResolver(refundFormSchema),
  });
  const router = useRouter();
  const handleRefund: SubmitHandler<RefundFormValues> = async (data) => {
    try {
      if (isSameDay) {
        const request = await fetchWrapper.post("/user/payment/refund-order", {
          paymentId,
          ip,
          data,
        });
        if (request.status === 200) {
          close();
          router.refresh();
          reset();
        } else {
          setError("root", {
            message:
              "İade işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.",
          });
        }
      }

      return null;
    } catch (error) {}
  };
  return (
    <Fragment>
      <Button
        leftSection={<FaArrowRotateLeft size={18} />}
        variant="outline"
        color="red"
        radius="md"
        size="sm"
        className="transition-colors duration-200 hover:bg-red-50"
        onClick={open}
      >
        İade Et
      </Button>
      <CustomModal
        title="Siparişi İade Et"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        isOpen={opened}
        onClose={close}
      >
        <form onSubmit={handleSubmit(handleRefund)} className="space-y-6">
          <Textarea
            label="İptal nedeniniz"
            {...register("info")}
            minRows={3}
            autosize
            placeholder="Lütfen iptal nedeninizi belirtiniz..."
            styles={{
              label: {
                marginBottom: "8px",
                fontSize: "0.95rem",
                fontWeight: 500,
              },
              input: {
                "&:focus": {
                  borderColor: "#228be6",
                },
              },
            }}
          />

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" color="gray" onClick={close}>
              İptal
            </Button>

            <Button type="submit" loading={isSubmitting} color="blue">
              {isSubmitting ? "İade Ediliyor..." : "İade Et"}
            </Button>
          </div>
        </form>
      </CustomModal>
    </Fragment>
  );
};

export default CancelOrderButton;
