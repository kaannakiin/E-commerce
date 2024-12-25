"use client";
import { Card, Loader, Tabs } from "@mantine/core";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FaTurkishLiraSign } from "react-icons/fa6";
import { TbArrowBack, TbUsers } from "react-icons/tb";

const Charts = () => {
  const params = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onChangeTab = (tab: string) => {
    setLoading(true);
    const defaultParams = new URLSearchParams(params.toString());
    defaultParams.set("tab", tab);
    router.push(`?${defaultParams.toString()}`, { scroll: false });
    setLoading(false);
  };

  const iconSize = 20;

  return loading ? (
    <Loader type="dots" color="primary" />
  ) : (
    <Card>
      <Card.Section>
        <Tabs
          value={params.get("tab") || "sumSales"}
          onChange={(value) => {
            onChangeTab(value);
          }}
          styles={{
            tab: {
              transition: "all 0.3s ease",
              "&:hover": {
                background: "#f1f3f5",
                transform: "translateY(-2px)",
              },
              "&[data-active]": {
                background: "#228be6",
                color: "white",

                "&:hover": {
                  background: "#1c7ed6",
                },
              },
            },
            list: {
              borderBottom: "2px solid #e9ecef",
            },
          }}
        >
          <Tabs.List grow>
            <Tabs.Tab
              value="sumSales"
              leftSection={<FaTurkishLiraSign size={iconSize} />}
            >
              Toplam Satış
            </Tabs.Tab>

            <Tabs.Tab value="sumUser" leftSection={<TbUsers size={iconSize} />}>
              Oturum Sayısı
            </Tabs.Tab>
            <Tabs.Tab
              value="sumReturn"
              leftSection={<TbArrowBack size={iconSize} />}
            >
              İadeler
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </Card.Section>
    </Card>
  );
};

export default Charts;
