"use client";
import { Table, Tooltip } from "@mantine/core";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { BsFillPersonVcardFill } from "react-icons/bs";
import { FaUser, FaUserCog, FaUserShield } from "react-icons/fa";
import { HiMail } from "react-icons/hi";
import { MdOutlineError, MdVerified } from "react-icons/md";
import { UserTableType } from "../page";
import ButtonMenuUser from "./ButtonMenuUser";
interface UserTableProps {
  data: UserTableType[];
}

const UserTable = ({ data }: UserTableProps) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return {
          icon: <FaUserCog className="mr-2" size={18} />,
          color: "text-blue-600",
        };
      case "SUPERADMIN":
        return {
          icon: <FaUserShield className="mr-2" size={18} />,
          color: "text-purple-600",
        };
      default:
        return {
          icon: <FaUser className="mr-2" size={18} />,
          color: "text-gray-600",
        };
    }
  };

  return (
    <Table.ScrollContainer minWidth={500} type="native" className="rounded-lg">
      <Table horizontalSpacing="xl" verticalSpacing="md" highlightOnHover>
        <Table.Thead className="bg-gray-50">
          <Table.Tr>
            <Table.Th className="text-gray-700">
              <div className="flex items-center">
                <HiMail className="mr-2" size={20} />
                Email
              </div>
            </Table.Th>
            <Table.Th className="text-gray-700">
              <div className="flex items-center">
                <BsFillPersonVcardFill className="mr-2" size={18} />
                İsim Soyisim
              </div>
            </Table.Th>
            <Table.Th className="text-gray-700">Email Doğrulama</Table.Th>
            <Table.Th className="text-gray-700">Rol</Table.Th>
            <Table.Th className="text-gray-700">Detay</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data &&
            data.map((user) => {
              const roleStyle = getRoleIcon(user.role);
              return (
                <Table.Tr key={user.id}>
                  <Table.Td className="text-sm">{user.email}</Table.Td>
                  <Table.Td className="text-sm font-medium capitalize">
                    {user.name} {user.surname}
                  </Table.Td>
                  <Table.Td>
                    <div className="flex items-center">
                      {user.emailVerified ? (
                        <Tooltip
                          transitionProps={{ duration: 200 }}
                          label={format(
                            new Date(user.emailVerified),
                            "dd MMMM yyyy EEEE HH:mm",
                            {
                              locale: tr,
                            },
                          )}
                        >
                          <div className="flex items-center text-green-600">
                            <MdVerified className="mr-2" size={18} />
                            <span>Doğrulandı</span>
                          </div>
                        </Tooltip>
                      ) : (
                        <div className="flex items-center text-red-500">
                          <MdOutlineError className="mr-2" size={18} />
                          <span>Doğrulanmadı</span>
                        </div>
                      )}
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <div className={`flex items-center ${roleStyle.color}`}>
                      {roleStyle.icon}
                      <span>
                        {user.role === "ADMIN"
                          ? "Yönetici"
                          : user.role === "SUPERADMIN"
                            ? "Süper Yönetici"
                            : "Kullanıcı"}
                      </span>
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <ButtonMenuUser role={user.role} id={user.id} />
                  </Table.Td>
                </Table.Tr>
              );
            })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};

export default UserTable;
