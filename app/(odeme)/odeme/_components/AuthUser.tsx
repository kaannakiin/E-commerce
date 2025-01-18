"use client";
import AddressForm from "@/app/(kullanici)/hesabim/adres-defterim/_components/AddressForm";
import { useStore } from "@/store/store";
import {
  ActionIcon,
  Card,
  Checkbox,
  Grid,
  Modal,
  Paper,
  Tabs,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaCreditCard,
  FaEdit,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
} from "react-icons/fa";
import { MdAdd } from "react-icons/md";
import { Address, BankTransferDetailProps } from "../page";
import AccordionForPayment from "./AccordionForPayment";
import PaymentForm from "./PaymentForm";

const AuthUser = ({
  addresses,
  email,
  bankTransferData,
}: {
  addresses: Address[];
  email: string;
  bankTransferData: BankTransferDetailProps;
}) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [openedEdit, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const totalFinalPrice = useStore((state) => state.totalFinalPrice);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [defaultAddressId, setDefaultAddressId] = useState<string>("");
  const activeTab = searchParams.get("tab") || "address";
  const updateTabInURL = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", value);
    router.push(`?${params.toString()}`, { scroll: false });
  };
  useEffect(() => {
    if (addresses.length > 0 && !defaultAddressId) {
      setDefaultAddressId(addresses[0].id);
    }
  }, [addresses, defaultAddressId]);

  const handleEditClick = (address: Address) => {
    setSelectedAddress(address);
    openEdit();
  };
  return (
    <Tabs value={activeTab} onChange={updateTabInURL}>
      <Tabs.List grow>
        <Tabs.Tab
          value="address"
          className="text-xl"
          leftSection={<FaMapMarkerAlt className="h-4 w-4" />}
        >
          Adres
        </Tabs.Tab>

        <Tabs.Tab
          value="payment"
          className="text-xl"
          leftSection={<FaCreditCard className="h-4 w-4" />}
        >
          Ödeme
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="address" p={8}>
        <UnstyledButton
          onClick={open}
          className="mb-4 flex w-full items-center justify-center gap-3 rounded-lg bg-primary-900/5 px-4 py-3.5 active:bg-primary-900/15 sm:hover:bg-primary-900/10"
        >
          <Paper
            radius={"xl"}
            bg={"primary.9"}
            className="flex h-8 w-8 items-center justify-center text-white active:scale-95 sm:group-hover:scale-110"
          >
            <MdAdd size={20} />
          </Paper>
          <Text size="lg" fw={400} c={"primary.9"}>
            Yeni Adres Ekle
          </Text>
        </UnstyledButton>
        <Grid>
          {addresses.map((address) => (
            <Grid.Col key={address.id} span={{ base: 12 }}>
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                className={`h-[200px] transition-colors ${defaultAddressId === address.id ? "bg-primary-100" : ""}`}
                bg={defaultAddressId === address.id ? "primary.2" : undefined}
              >
                <div className="flex h-full flex-col font-medium">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        className="cursor-pointer"
                        checked={defaultAddressId === address.id}
                        onChange={() => setDefaultAddressId(address.id)}
                        aria-label="Varsayılan adres olarak seç"
                        size="md"
                        color="primary"
                      />
                      <Text fw={500} size="lg">
                        {address.addressTitle}
                      </Text>
                    </div>
                    <div className="flex gap-2">
                      <ActionIcon
                        variant="default"
                        onClick={() => handleEditClick(address)}
                      >
                        <FaEdit size={18} />
                      </ActionIcon>
                    </div>
                  </div>

                  <div className="mb-2 flex items-center gap-2">
                    <FaUser size={16} className="flex-shrink-0" />
                    <Text
                      size="sm"
                      className="truncate font-bold"
                      tt="capitalize"
                    >
                      {address.name + " " + address.surname}
                    </Text>
                  </div>

                  <div className="mb-2 flex items-center gap-2">
                    <FaPhone size={16} className="flex-shrink-0" />
                    <Text size="sm" className="font-bold">
                      {address.phone}
                    </Text>
                  </div>

                  <div className="flex flex-1 gap-2">
                    <FaMapMarkerAlt size={16} className="mt-1 flex-shrink-0" />
                    <p className="line-clamp-2 text-sm font-bold text-gray-500">
                      {address.addressDetail}, {address.district} /
                      {address.city}
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
          <AddressForm email={email} onClose={close} />       
        </Modal>
      </Tabs.Panel>

      <Tabs.Panel value="payment">
        {bankTransferData && bankTransferData.description ? (
          <AccordionForPayment
            data={bankTransferData}
            defaultAddressId={defaultAddressId}
          />
        ) : (
          <PaymentForm address={defaultAddressId} />
        )}
      </Tabs.Panel>
    </Tabs>
  );
};

export default AuthUser;
