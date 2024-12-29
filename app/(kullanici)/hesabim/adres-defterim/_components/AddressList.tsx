"use client";
import FeedbackDialog from "@/components/FeedbackDialog";
import {
  ActionIcon,
  Box,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Modal,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  FaEdit, // Plus/Ekle ikonu
  FaMapMarkerAlt, // Trash/Çöp ikonu
  FaPhone,
  FaPlus,
  FaTimes, // Edit/Düzenle ikonu
  FaTrash, // Telefon ikonu
  FaUser,
} from "react-icons/fa";
import { deleteAddress } from "../_actions/AddressActions";
import AddressForm from "./AddressForm";
interface Address {
  id: string;
  name: string;
  surname: string;
  phone: string;
  city: string;
  district: string;
  addressDetail: string;
  addressTitle: string;
}

const AddressList = ({
  addresses,
  email,
}: {
  addresses: Address[];
  email: string;
}) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [openedEdit, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [openedDelete, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });
  const { refresh } = useRouter();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const handleDeleteClick = async (address: Address) => {
    setSelectedAddress(address);

    openDelete();
  };

  // Düzenleme işlemi için handler
  const handleEditClick = (address: Address) => {
    setSelectedAddress(address);
    openEdit();
  };

  // Silme onaylama işlemi
  const confirmDelete = async () => {
    try {
      if (!selectedAddress) return;

      await deleteAddress(selectedAddress.id).then((res) => {
        if (res.success) {
          setDialogState({
            isOpen: true,
            message: res.message,
            type: "success",
          });
          refresh();
        }
        if (!res.success) {
          setDialogState({
            isOpen: true,
            message: res.message,
            type: "error",
          });
        }
      });
      closeDelete();
      setSelectedAddress(null);
      // Burada bir revalidate veya refresh işlemi yapabilirsiniz
    } catch (error) {
      setDialogState({
        isOpen: true,
        message: "Bir hata oluştu",
        type: "error",
      });
    }
  };

  return (
    <Container size="lg" py="xl">
      {/* Üst Başlık ve Ekle Butonu */}
      <Group justify="space-between" mb="xl">
        <Title order={2}>Adres Defterim</Title>
        <Button
          leftSection={<FaPlus size={20} />}
          onClick={open}
          variant="filled"
          radius="md"
        >
          Yeni Adres Ekle
        </Button>
      </Group>
      <Grid>
        {addresses.map((address) => (
          <Grid.Col key={address.id} span={{ base: 12, sm: 6, lg: 4 }}>
            <Card
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              className="h-[200px]"
            >
              <div className="flex h-full flex-col">
                <div className="mb-3 flex items-center justify-between">
                  <Text fw={500} size="lg">
                    {address.addressTitle}
                  </Text>
                  <div className="flex gap-2">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => handleEditClick(address)}
                    >
                      <FaEdit size={18} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      onClick={() => handleDeleteClick(address)}
                    >
                      <FaTrash size={18} />
                    </ActionIcon>
                  </div>
                </div>

                <div className="mb-2 flex items-center gap-2">
                  <FaUser size={16} className="flex-shrink-0" />
                  <Text size="sm" className="truncate">
                    {address.name.charAt(0).toUpperCase() +
                      address.name.slice(1).toLowerCase()}
                    {address.surname.charAt(0).toUpperCase() +
                      address.surname.slice(1).toLowerCase()}
                  </Text>
                </div>

                <div className="mb-2 flex items-center gap-2">
                  <FaPhone size={16} className="flex-shrink-0" />
                  <Text size="sm">{address.phone}</Text>
                </div>

                <div className="flex flex-1 gap-2">
                  <FaMapMarkerAlt size={16} className="mt-1 flex-shrink-0" />
                  <p className="line-clamp-2 text-sm text-gray-500">
                    {address.addressDetail}, {address.district} / {address.city}
                  </p>
                </div>
              </div>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
      <Modal
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        opened={openedDelete}
        onClose={() => {
          closeDelete();
          setSelectedAddress(null);
        }}
        centered
        withCloseButton={false}
        size="md"
      >
        <Box>
          <Group align="center" justify="center" mb="xl">
            <div className="rounded-full bg-red-50 p-3">
              <FaTrash size={24} className="text-red-500" />
            </div>
          </Group>

          <Text ta="center" fw={500} size="lg" mb="xs">
            Adresi Silmek İstediğinize Emin Misiniz?
          </Text>

          <Text ta="center" c="dimmed" size="sm" mb="xl">
            &quot;{selectedAddress?.addressTitle}&quot; adresini silmek
            üzeresiniz. Bu işlem geri alınamaz.
          </Text>

          <Group justify="center" gap="md">
            <Button
              variant="light"
              color="gray"
              size="md"
              radius="md"
              onClick={() => {
                closeDelete();
                setSelectedAddress(null);
              }}
              leftSection={<FaTimes size={16} />}
              className="hover:bg-gray-100"
            >
              İptal Et
            </Button>

            <Button
              variant="filled"
              color="red"
              size="md"
              radius="md"
              onClick={confirmDelete}
              leftSection={<FaTrash size={16} />}
              className="bg-red-500 hover:bg-red-600"
            >
              Evet, Sil
            </Button>
          </Group>
        </Box>
      </Modal>
      {/* Düzenleme Modalı */}
      <Modal
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        opened={openedEdit}
        onClose={() => {
          closeEdit();
          setSelectedAddress(null);
        }}
        title="Adresi Düzenle"
        size="md"
        centered
      >
        <AddressForm
          email={"akinkaan49@gmail.com"}
          defaultValues={selectedAddress}
          type="edit"
          onClose={closeEdit}
        />
      </Modal>
      {/* Yeni Adres Modalı */}
      <Modal
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        opened={opened}
        onClose={close}
        title="Yeni Adres Ekle"
        size="md"
        centered
      >
        <AddressForm email={"akinkaan49@gmail.com"} onClose={close} />
      </Modal>
      <FeedbackDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
        message={dialogState.message}
        type={dialogState.type}
      />
    </Container>
  );
};

export default AddressList;
