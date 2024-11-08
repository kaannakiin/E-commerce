import React, { useEffect } from "react";
import { Dialog, Text } from "@mantine/core";
import { FaCheck, FaTimes } from "react-icons/fa";

type FeedbackDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type?: "success" | "error";
  autoCloseDelay?: number;
};

const FeedbackDialog = ({
  isOpen,
  onClose,
  message,
  type = "success",
  autoCloseDelay = 2000,
}: FeedbackDialogProps) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, autoCloseDelay]);

  return (
    <Dialog opened={isOpen} onClose={onClose} size="sm" radius="sm">
      <div className="flex flex-col items-center justify-center p-4 text-center">
        <div
          className={`mb-4 rounded-full p-3 ${
            type === "success" ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {type === "success" ? (
            <FaCheck size={32} className="text-green-500" />
          ) : (
            <FaTimes size={32} className="text-red-500" />
          )}
        </div>
        <Text size="xl" fw={600} className="mb-2">
          {type === "success" ? "İşlem Başarılı!" : "Hata!"}
        </Text>
        <Text size="sm" c="dimmed" className="mb-4">
          {message}
        </Text>
      </div>
    </Dialog>
  );
};

export default FeedbackDialog;
