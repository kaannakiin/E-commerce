"use client";
import { Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React from "react";

const CookiesModal = () => {
  const [opened, { open, close }] = useDisclosure();
  return (
    <Modal opened={opened} onClose={close}>
      CookiesModal
    </Modal>
  );
};

export default CookiesModal;
