"use client";
import { Menu } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiEdit, FiEye, FiToggleLeft, FiTrash2 } from "react-icons/fi";
import { deleteDiscount, switchActive } from "../_actions/toggleAction";

interface ToggleActionMenuProps {
  isExpired: boolean;
  discountId: string;
  isActive: boolean;
}

interface ServerResponse {
  success: boolean;
  message: string;
}

const ToggleActionMenu = ({
  isExpired,
  discountId,
  isActive,
}: ToggleActionMenuProps) => {
  const [open, setOpen] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });
  const router = useRouter();
  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({
      show: true,
      message,
      type,
    });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 2000);
  };

  const handleToggleActive = async () => {
    try {
      const response: ServerResponse = await switchActive(discountId);
      setOpen(false);
      showNotification(
        response.message,
        response.success ? "success" : "error",
      );
    } catch (error) {
      showNotification("Bir hata oluştu", "error");
      console.error("Error toggling status:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const response: ServerResponse = await deleteDiscount(discountId);
      setOpen(false);
      showNotification(
        response.message,
        response.success ? "success" : "error",
      );
    } catch (error) {
      showNotification("Bir hata oluştu", "error");
      console.error("Error deleting discount:", error);
    }
  };
  const editPage = () => {
    setOpen(false);
    router.push(`/admin/indirim-kodu/${discountId}`);
  };
  return (
    <div className="relative">
      {notification.show && (
        <div
          className={`absolute bottom-full right-0 mb-2 whitespace-nowrap rounded px-3 py-1.5 text-xs text-white ${
            notification.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
          style={{
            animation: "fade-in-out 2s ease-in-out",
          }}
        >
          {notification.message}
        </div>
      )}

      <Menu
        opened={open}
        onClose={() => setOpen(false)}
        position="bottom-end"
        withArrow
      >
        <Menu.Target>
          <BsThreeDotsVertical
            size={16}
            className="cursor-pointer"
            onClick={() => setOpen((prev) => !prev)}
          />
        </Menu.Target>
        <Menu.Dropdown>
          {!isExpired ? (
            <>
              <Menu.Item leftSection={<FiEdit size={14} />} onClick={editPage}>
                Düzenle
              </Menu.Item>
              <Menu.Item
                leftSection={<FiToggleLeft size={14} />}
                color={isActive ? "red" : "green"}
                onClick={handleToggleActive}
              >
                {isActive ? "Pasifleştir" : "Aktifleştir"}
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<FiTrash2 size={14} />}
                color="red"
                onClick={handleDelete}
              >
                Sil
              </Menu.Item>
            </>
          ) : (
            <>
              <Menu.Item leftSection={<FiEye size={14} />} onClick={editPage}>
                Detayları Gör
              </Menu.Item>
              <Menu.Item
                leftSection={<FiToggleLeft size={14} />}
                color="green"
                onClick={handleToggleActive}
              >
                Aktife Al
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<FiTrash2 size={14} />}
                color="red"
                onClick={handleDelete}
              >
                Sil
              </Menu.Item>
            </>
          )}
        </Menu.Dropdown>
      </Menu>

      <style jsx>{`
        @keyframes fade-in-out {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          15% {
            opacity: 1;
            transform: translateY(0);
          }
          85% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
};

export default ToggleActionMenu;
