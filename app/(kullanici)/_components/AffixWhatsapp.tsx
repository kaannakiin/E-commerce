"use client";
import {
  ActionIcon,
  Affix,
  Button,
  Modal,
  Text,
  Stack,
  Group,
  Title,
  Divider,
  Switch,
  Paper,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Fragment, useEffect, useState } from "react";
import { BsWhatsapp } from "react-icons/bs";
import { LuCookie } from "react-icons/lu";

interface AffixWhatsappProps {
  url: string;
  text: string;
}

const AffixWhatsapp = ({ url, text }: AffixWhatsappProps) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [cookieAccepted, setCookieAccepted] = useState(false);
  const [cookieSettings, setCookieSettings] = useState({
    necessary: true, // Her zaman true
    functional: true,
    analytics: true,
    marketing: true,
  });

  useEffect(() => {
    const cookieStatus = localStorage.getItem("cookieConsent");
    const savedSettings = localStorage.getItem("cookieSettings");

    if (cookieStatus === "accepted") {
      setCookieAccepted(true);
      if (savedSettings) {
        setCookieSettings(JSON.parse(savedSettings));
      }
    } else {
      open();
    }
  }, [open]);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    localStorage.setItem("cookieConsent", "accepted");
    localStorage.setItem("cookieSettings", JSON.stringify(allAccepted));
    setCookieSettings(allAccepted);
    setCookieAccepted(true);
    close();
  };

  const handleSaveSettings = () => {
    localStorage.setItem("cookieConsent", "accepted");
    localStorage.setItem("cookieSettings", JSON.stringify(cookieSettings));
    setCookieAccepted(true);
    close();
  };

  const handleOpenSettings = () => {
    open();
  };

  const toggleSetting = (setting: keyof typeof cookieSettings) => {
    if (setting === "necessary") return; // Zorunlu çerezler değiştirilemez
    setCookieSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  return (
    <Fragment>
      <Affix position={{ bottom: !cookieAccepted ? 60 : 20, right: 20 }}>
        <ActionIcon
          component="a"
          href={`https://wa.me/+90${url.replace(/\D/g, "")}`}
          target="_blank"
          variant="transparent"
          color="green"
        >
          <BsWhatsapp size={40} />
        </ActionIcon>
      </Affix>

      {!cookieAccepted && (
        <Affix position={{ bottom: 20, right: 20 }}>
          <ActionIcon
            variant="transparent"
            color="black"
            onClick={handleOpenSettings}
          >
            <LuCookie size={40} />
          </ActionIcon>
        </Affix>
      )}

      <Modal
        opened={opened}
        onClose={close}
        title={
          <Group>
            <LuCookie size={24} />
            <Title order={3}>Çerez Tercihleri</Title>
          </Group>
        }
        size="lg"
        padding="lg"
      >
        <Stack gap="md">
          <Text size="sm" color="dimmed">
            Size daha iyi bir deneyim sunabilmek ve hizmetlerimizi
            geliştirebilmek için çerezleri kullanıyoruz. Çerez tercihlerinizi
            buradan yönetebilirsiniz.
          </Text>

          <Divider />

          <Stack gap="lg">
            <Paper withBorder p="md" radius="md">
              <Group justify="apart">
                <div>
                  <Text fw={500}>Zorunlu Çerezler</Text>
                  <Text size="xs" color="dimmed">
                    Sitenin çalışması için gerekli olan temel çerezler
                  </Text>
                </div>
                <Switch checked={cookieSettings.necessary} disabled />
              </Group>
            </Paper>

            <Paper withBorder p="md" radius="md">
              <Group justify="apart">
                <div>
                  <Text fw={500}>Fonksiyonel Çerezler</Text>
                  <Text size="xs" color="dimmed">
                    Gelişmiş site özellikleri ve kişiselleştirme için kullanılır
                  </Text>
                </div>
                <Switch
                  checked={cookieSettings.functional}
                  onChange={() => toggleSetting("functional")}
                />
              </Group>
            </Paper>

            <Paper withBorder p="md" radius="md">
              <Group justify="apart">
                <div>
                  <Text fw={500}>Analitik Çerezler</Text>
                  <Text size="xs" color="dimmed">
                    Site kullanımını analiz etmek için kullanılır
                  </Text>
                </div>
                <Switch
                  checked={cookieSettings.analytics}
                  onChange={() => toggleSetting("analytics")}
                />
              </Group>
            </Paper>

            <Paper withBorder p="md" radius="md">
              <Group justify="apart">
                <div>
                  <Text fw={500}>Pazarlama Çerezleri</Text>
                  <Text size="xs" color="dimmed">
                    Kişiselleştirilmiş reklamlar için kullanılır
                  </Text>
                </div>
                <Switch
                  checked={cookieSettings.marketing}
                  onChange={() => toggleSetting("marketing")}
                />
              </Group>
            </Paper>
          </Stack>

          <Divider />

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-end">
            <Button variant="light" color="gray" onClick={close}>
              Reddet
            </Button>
            <Button variant="light" color="red" onClick={handleSaveSettings}>
              Seçilenleri Kaydet
            </Button>
            <Button variant="filled" color="blue" onClick={handleAcceptAll}>
              Tümünü Kabul Et
            </Button>
          </div>
        </Stack>
      </Modal>
    </Fragment>
  );
};

export default AffixWhatsapp;
