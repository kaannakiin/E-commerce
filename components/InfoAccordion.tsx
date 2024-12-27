"use client";
import { Accordion, ScrollArea,Text } from "@mantine/core";
import React from "react";
import { MdOutlineDescription } from "react-icons/md";

interface ProductDetailsProps {
  richText: string;
}

interface AccordionLabelProps {
  label: string;
  icon: React.ReactNode;
}

const AccordionLabel = ({ label, icon }: AccordionLabelProps) => {
  return (
    <div className="flex items-center gap-3">
      <Text c='primary.5' className="text-xl">{icon}</Text>
      <Text className="font-medium text-gray-700">{label}</Text>
    </div>
  );
};

const ProductDetails = ({ richText }: ProductDetailsProps) => {
  return (
    <div className="mt-8 border-t pt-6">
      <Accordion variant="default" radius="md">
        <Accordion.Item value="description">
          <Accordion.Control px={0} py={0}>
            <AccordionLabel
              label="Ürün Açıklaması"
              icon={<MdOutlineDescription />}
            />
          </Accordion.Control>
          <Accordion.Panel p={0}>
            <ScrollArea.Autosize
              mah={180}
              type="scroll"
              scrollbarSize={6}
              offsetScrollbars
              p={0}
            >
              {richText ? (
                <div
                  className="prose prose-sm max-w-none text-gray-600"
                  dangerouslySetInnerHTML={{ __html: richText }}
                />
              ) : (
                <p className="text-gray-500">
                  Ürün açıklaması bulunmamaktadır.
                </p>
              )}
            </ScrollArea.Autosize>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default ProductDetails;
