"use client";
import { IdForEverythingType } from "@/zodschemas/authschema";
import { Button, Menu } from "@mantine/core";
import { Role } from "@prisma/client";
import { Fragment, useState } from "react";
import { FaUserCog } from "react-icons/fa";
import { HiDotsVertical } from "react-icons/hi";
import { LiaUserSolid } from "react-icons/lia";
import { MdAdminPanelSettings, MdSupervisorAccount } from "react-icons/md";
import { UserUpdateRole } from "../_actions/UserAction";
import { useRouter } from "next/navigation";
import FeedbackDialog from "@/components/FeedbackDialog";

interface ButtonMenuUserProps {
  role: Role;
  id: IdForEverythingType;
}

type RoleUpdateParams = {
  id: IdForEverythingType;
  newRole: Role;
};
type DialogState = {
  isOpen: boolean;
  message: string;
  type: "success" | "error";
};

const ButtonMenuUser = ({ role, id }: ButtonMenuUserProps) => {
  const { refresh } = useRouter();
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    message: "",
    type: "success",
  });
  const updateUserRole = async ({ id, newRole }: RoleUpdateParams) => {
    try {
      await UserUpdateRole({ id, newRole }).then((res) => {
        if (res.success) {
          setDialogState((prev) => ({
            ...prev,
            isOpen: true,
            message: "Rol güncellendi",
            type: "success",
          }));
        } else {
          setDialogState((prev) => ({
            ...prev,
            isOpen: true,
            message: res.message,
            type: "error",
          }));
        }
        refresh();
      });
    } catch (error) {
      setDialogState((prev) => ({
        ...prev,
        isOpen: true,
        message: "Bir hata oluştu",
        type: "error",
      }));
    }
  };

  const handleRoleUpdate = (newRole: Role) => {
    return () => updateUserRole({ id, newRole });
  };

  return (
    <Fragment>
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <Button
            size="xs"
            variant="outline"
            leftSection={<HiDotsVertical size={14} />}
            className="transition-colors hover:bg-gray-50"
          >
            Detay
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          {role === "SUPERADMIN" && (
            <Fragment>
              <Menu.Label className="font-medium text-gray-700">
                <div className="flex items-center gap-2">
                  <FaUserCog size={14} />
                  Rol Yönetimi
                </div>
              </Menu.Label>
              <Menu.Item component="button" onClick={handleRoleUpdate("ADMIN")}>
                <div className="flex items-center gap-2">
                  <MdAdminPanelSettings size={16} className="text-blue-600" />
                  <span>Yönetici Yap</span>
                </div>
              </Menu.Item>
              <Menu.Item component="button" onClick={handleRoleUpdate("USER")}>
                <div className="flex items-center gap-2">
                  <LiaUserSolid size={16} className="text-gray-600" />
                  <span>User Yap</span>
                </div>
              </Menu.Item>
            </Fragment>
          )}
          {role === "USER" && (
            <Fragment>
              <Menu.Label className="font-medium text-gray-700">
                <div className="flex items-center gap-2">
                  <FaUserCog size={14} />
                  Rol Yönetimi
                </div>
              </Menu.Label>

              <Menu.Item component="button" onClick={handleRoleUpdate("ADMIN")}>
                <div className="flex items-center gap-2">
                  <MdAdminPanelSettings size={16} className="text-blue-600" />
                  <span>Yönetici Yap</span>
                </div>
              </Menu.Item>

              <Menu.Item
                component="button"
                onClick={handleRoleUpdate("SUPERADMIN")}
              >
                <div className="flex items-center gap-2">
                  <MdSupervisorAccount size={16} className="text-purple-600" />
                  <span>Süperyönetici Yap</span>
                </div>
              </Menu.Item>
            </Fragment>
          )}

          {role === "ADMIN" && (
            <Fragment>
              <Menu.Label className="font-medium text-gray-700">
                <div className="flex items-center gap-2">
                  <FaUserCog size={14} />
                  Rol Yönetimi
                </div>
              </Menu.Label>

              <Menu.Item component="button" onClick={handleRoleUpdate("USER")}>
                <div className="flex items-center gap-2">
                  <LiaUserSolid size={16} className="text-gray-600" />
                  <span>User Yap</span>
                </div>
              </Menu.Item>

              <Menu.Item
                component="button"
                onClick={handleRoleUpdate("SUPERADMIN")}
              >
                <div className="flex items-center gap-2">
                  <MdSupervisorAccount size={16} className="text-purple-600" />
                  <span>Süperyönetici Yap</span>
                </div>
              </Menu.Item>
            </Fragment>
          )}
        </Menu.Dropdown>
      </Menu>{" "}
      <FeedbackDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
        message={dialogState.message}
        type={dialogState.type}
      />
    </Fragment>
  );
};

export default ButtonMenuUser;
