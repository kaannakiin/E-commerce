"use client";
import { Menu } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiEdit, FiEye, FiToggleLeft, FiTrash2 } from "react-icons/fi";
import { IoReorderThreeSharp } from "react-icons/io5";
import { deleteDiscount, switchActive } from "../_actions/toggleAction";
import { DiscountStatus } from "./DiscountTable";
interface ToggleActionMenuProps {
  discountId: string;
  isActive: boolean;
  status: DiscountStatus;
}

interface NotificationType {
  show: boolean;
  message: string;
  type: "success" | "error";
}

const ToggleActionMenu = ({
  discountId,
  isActive,
  status,
}: ToggleActionMenuProps) => {
  const router = useRouter();
  const [notification, setNotification] = useState<NotificationType>({
    show: false,
    message: "",
    type: "success",
  });

  // Derived state calculations
  const isDisabled = status.isExpired || status.isLimitReached;
  const canPerformActions = !isDisabled;

  // Notification handler
  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ show: true, message, type });

    const timer = setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 2000);

    return () => clearTimeout(timer);
  };

  // Action handlers
  const handleToggleActive = async () => {
    try {
      const response = await switchActive(discountId);
      if (response.success) {
        showNotification(response.message, "success");
        router.refresh(); // Refresh the page to update the data
      } else {
        showNotification(response.message, "error");
      }
    } catch (error) {
      showNotification("İşlem sırasında bir hata oluştu", "error");
      console.error("Toggle error:", error);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm("Bu indirim kodunu silmek istediğinizden emin misiniz?")
    ) {
      return;
    }

    try {
      const response = await deleteDiscount(discountId);
      if (response.success) {
        showNotification(response.message, "success");
        router.refresh(); // Refresh the page to update the data
      } else {
        showNotification(response.message, "error");
      }
    } catch (error) {
      showNotification("Silme işlemi sırasında bir hata oluştu", "error");
      console.error("Delete error:", error);
    }
  };

  const handleEdit = () => {
    router.push(`/admin/indirim-kodu/${discountId}`);
  };

  return (
    <div className="relative">
      {/* Notification Component */}
      {notification.show && (
        <div
          className={`absolute bottom-full right-0 mb-2 whitespace-nowrap rounded px-3 py-1.5 text-xs text-white ${notification.type === "success" ? "bg-green-500" : "bg-red-500"} animate-fade-in-out`}
          role="alert"
        >
          {notification.message}
        </div>
      )}

      {/* Menu Component */}
      <Menu position="bottom-end" shadow="md">
        <Menu.Target>
          <button className="rounded p-1 hover:bg-gray-100">
            <IoReorderThreeSharp className="h-5 w-5 text-gray-600" />
          </button>
        </Menu.Target>

        <Menu.Dropdown>
          {isDisabled ? (
            <>
              <Menu.Item leftSection={<FiEye size={14} />} onClick={handleEdit}>
                Detayları Gör
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<FiTrash2 size={14} />}
                onClick={handleDelete}
                color="red"
              >
                Sil
              </Menu.Item>
            </>
          ) : (
            // Full options for active discounts
            <>
              <Menu.Item
                leftSection={<FiEdit size={14} />}
                onClick={handleEdit}
              >
                Düzenle
              </Menu.Item>
              <Menu.Item
                leftSection={<FiToggleLeft size={14} />}
                onClick={handleToggleActive}
                color={isActive ? "red" : "green"}
              >
                {isActive ? "Pasifleştir" : "Aktifleştir"}
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<FiTrash2 size={14} />}
                onClick={handleDelete}
                color="red"
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
        .animate-fade-in-out {
          animation: fade-in-out 2s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ToggleActionMenu;
