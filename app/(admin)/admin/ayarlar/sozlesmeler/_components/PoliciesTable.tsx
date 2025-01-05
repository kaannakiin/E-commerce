"use client";
import { ActionIcon, Button, Table } from "@mantine/core";
import React, { useState } from "react";
import { PoliciesType } from "../page";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { agreementLabels } from "./PolicyForm";
import Link from "next/link";
import { FaEdit, FaTrash } from "react-icons/fa";
import { deletePolicy } from "../_actions/PoliciesActions";
import { useRouter } from "next/navigation";
import FeedbackDialog from "@/components/FeedbackDialog";

interface PoliciesTableProps {
  data: PoliciesType[];
}

const PoliciesTable = ({ data }: PoliciesTableProps) => {
  const { refresh } = useRouter();
  const [feedbackState, setFeedbackState] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });
  return (
    <Table.ScrollContainer minWidth={500}>
      <Table highlightOnHover striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th w="25%">Sözleşme Başlığı</Table.Th>
            <Table.Th w="25%">Sözleşme Türü</Table.Th>
            <Table.Th w="25%">Eklenme Tarihi</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.map((item) => (
            <Table.Tr key={item.id}>
              <Table.Td w="25%">{item.title}</Table.Td>
              <Table.Td w="25%" fw={700}>
                {agreementLabels[item.type]}
              </Table.Td>
              <Table.Td w="25%">
                {format(new Date(item.createdAt), "dd MMMM yyyy EEEE HH:mm", {
                  locale: tr,
                })}
              </Table.Td>
              <Table.Td w="25%">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    component={Link}
                    variant="outline"
                    size="xs"
                    href={`/admin/ayarlar/sozlesmeler/${item.id}`}
                    leftSection={<FaEdit size={14} />}
                  >
                    Düzenle
                  </Button>
                  <Button
                    variant="subtle"
                    color="red"
                    size="xs"
                    onClick={async () => {
                      await deletePolicy(item.id).then((res) => {
                        if (res.success) {
                          setFeedbackState({
                            isOpen: true,
                            message: res.message,
                            type: "success",
                          });
                          refresh();
                        } else {
                          setFeedbackState({
                            isOpen: true,
                            message: res.message,
                            type: "error",
                          });
                        }
                      });
                    }}
                    leftSection={<FaTrash size={14} />}
                  >
                    Sil
                  </Button>
                </div>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>{" "}
      <FeedbackDialog
        isOpen={feedbackState.isOpen}
        onClose={() => setFeedbackState((prev) => ({ ...prev, isOpen: false }))}
        message={feedbackState.message}
        type={feedbackState.type}
      />
    </Table.ScrollContainer>
  );
};

export default PoliciesTable;
