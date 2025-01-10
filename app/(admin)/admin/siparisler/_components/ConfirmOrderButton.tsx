"use client";
import FeedbackDialog from "@/components/FeedbackDialog";
import { Button } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

interface ConfirmOrderFormProps {
  orderId: string;
}

export default function ConfirmOrderButton({ orderId }: ConfirmOrderFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (dialogState.isOpen) {
      timeoutId = setTimeout(() => {
        setDialogState((prev) => ({ ...prev, isOpen: false }));
      }, 1000); // 1 saniye sonra kapat
    }

    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [dialogState.isOpen]);

  const handleSubmit = async (formData: FormData) => {
    // startTransition(async () => {
    //   await confirmOrder(orderId).then((res) => {
    //     if (res.success) {
    //       setDialogState({
    //         isOpen: true,
    //         message: res.message,
    //         type: "success",
    //       });
    //       router.refresh();
    //     } else {
    //       setDialogState({
    //         isOpen: true,
    //         message: res.message,
    //         type: "error",
    //       });
    //     }
    //   });
    // });
  };

  return (
    <form action={handleSubmit}>
      <Button type="submit" loading={isPending}>
        Siparişi Onayla
      </Button>
      <FeedbackDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
        message={dialogState.message}
        type={dialogState.type}
      />
    </form>
  );
}
