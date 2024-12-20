"use client";
import { Menu, rem, UnstyledButton } from "@mantine/core";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdDeleteOutline } from "react-icons/md";
import { TbArrowsLeftRight } from "react-icons/tb";
import {
  deleteSliderAction,
  setStatusSliderAction,
} from "../_actions/SliderAction";
import { useRouter } from "next/navigation";
const ActionMenu = ({ id, isActive }: { id: string; isActive: boolean }) => {
  const { refresh } = useRouter();
  const setStatus = async () => {
    await setStatusSliderAction(id, !isActive).then((res) => {
      if (res.success) {
        refresh();
      }
    });
  };
  const deleteSlider = async () => {
    await deleteSliderAction(id).then((res) => {
      if (res.success) {
        refresh();
      }
    });
  };
  return (
    <Menu trigger="click" shadow="md" width={150} classNames={{}}>
      <Menu.Target>
        <div className="flex w-full items-center justify-end">
          <BsThreeDotsVertical className="cursor-pointer" />
        </div>
      </Menu.Target>
      <Menu.Dropdown fw={500}>
        <Menu.Item
          onClick={setStatus}
          color={isActive ? "red" : "green"}
          leftSection={
            <TbArrowsLeftRight style={{ width: rem(14), height: rem(14) }} />
          }
        >
          {isActive ? "Pasif " : "Aktif"}
        </Menu.Item>
        <Menu.Item
          onClick={deleteSlider}
          color="red"
          leftSection={
            <MdDeleteOutline style={{ width: rem(14), height: rem(14) }} />
          }
        >
          Sil
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default ActionMenu;
