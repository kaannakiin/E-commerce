"use client";
import { Badge, Button, ScrollArea, Table, Text } from "@mantine/core";
import { HeroTable } from "../page";
import { BsThreeDotsVertical } from "react-icons/bs";
import ActionMenu from "./ActionMenu";
import ImageModal from "./ImageModal";
import Link from "next/link";
import { FaPlus } from "react-icons/fa";
const SliderTable = ({ slider }: { slider: HeroTable }) => {
  return (
    <div className="px-4 py-10">
      <Button
        component={Link}
        href={"/admin/ayarlar/slider/ekle"}
        leftSection={<FaPlus className="h-4 w-4" />}
        className="mb-4"
      >
        Slider Ekle
      </Button>
      <ScrollArea>
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Resim</Table.Th>
              <Table.Th>Tür</Table.Th>
              <Table.Th>Alt</Table.Th>
              <Table.Th>Tip</Table.Th>
              <Table.Th>Başlık</Table.Th>
              <Table.Th>Metin</Table.Th>
              <Table.Th>Buton Başlığı</Table.Th>
              <Table.Th>Durum</Table.Th>
              <Table.Th>İşlemler</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {slider.map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td>
                  <ImageModal url={item.image.url} />
                </Table.Td>
                <Table.Td>
                  <Badge color={item.isFunctionality ? "blue" : "gray"}>
                    {item.isFunctionality ? "Fonksiyonel" : "Normal"}
                  </Badge>
                </Table.Td>
                <Table.Td>{item.alt}</Table.Td>
                <Table.Td>{item.type === "IMAGE" ? "Resim" : "Video"}</Table.Td>
                <Table.Td>{item.title || "-"}</Table.Td>
                <Table.Td>
                  <div className="max-w-[200px] truncate">
                    {item.text || "-"}
                  </div>
                </Table.Td>
                <Table.Td>{item.buttonTitle || "-"}</Table.Td>
                <Table.Td>
                  <Badge color={item.isPublished ? "green" : "red"}>
                    {item.isPublished ? "Yayında" : "Taslak"}
                  </Badge>
                </Table.Td>{" "}
                <Table.Td>
                  <ActionMenu isActive={item.isPublished} id={item.id} />
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default SliderTable;
