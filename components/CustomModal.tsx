// components/ui/Modal.tsx
import {
  Modal as MantineModal,
  ModalProps as MantineModalProps,
} from "@mantine/core";
import { ReactNode } from "react";
import cx from "clsx";
interface CustomModalProps
  extends Omit<MantineModalProps, "opened" | "onClose"> {
  isOpen: boolean;
  onClose: () => void;
  title?: string | ReactNode;
  children: ReactNode;
  contentClassName?: string;
  titleClassName?: string;
}

export function CustomModal({
  isOpen,
  onClose,
  title,
  children,
  contentClassName,
  titleClassName,
  className,
  ...props
}: CustomModalProps) {
  return (
    <MantineModal
      opened={isOpen}
      onClose={onClose}
      classNames={{
        content: cx("rounded-xl shadow-lg border border-gray-100", className),
        header: cx(
          "px-6 py-4 bg-white rounded-t-xl border-b border-gray-100",
          titleClassName,
        ),
        body: cx("p-6 bg-white rounded-b-xl", contentClassName),
        title: "font-semibold text-lg text-gray-800",
        close: "hover:bg-gray-100 rounded-lg transition-colors duration-200",
      }}
      overlayProps={{
        blur: 3,
        opacity: 0.55,
        color: "#000",
      }}
      transitionProps={{
        duration: 200,
        transition: "fade",
      }}
      title={title}
      {...props}
    >
      {children}
    </MantineModal>
  );
}
