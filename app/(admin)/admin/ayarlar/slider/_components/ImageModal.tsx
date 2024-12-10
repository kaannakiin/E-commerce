"use client";
import React, { Fragment } from "react";
import { useDisclosure } from "@mantine/hooks";
import { Modal, Button, UnstyledButton } from "@mantine/core";
import CustomImage from "@/components/CustomImage";
import { MdOutlineRemoveRedEye } from "react-icons/md";

const ImageModal = ({ url }: { url: string }) => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <Fragment>
      <Modal
        opened={opened}
        onClose={close}
        centered
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        <div className="h-96 w-full">
          <CustomImage src={url} objectFit="contain" />
        </div>
      </Modal>

      <UnstyledButton
        onClick={open}
        className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-600 shadow-sm transition-all hover:bg-blue-100 active:scale-95"
      >
        <MdOutlineRemoveRedEye className="h-4 w-4" />
        Resmi Görüntüle
      </UnstyledButton>
    </Fragment>
  );
};

export default ImageModal;
