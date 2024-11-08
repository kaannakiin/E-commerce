"use client";
import React from "react";
import { Accordion } from "@mantine/core";
import { BiPackage } from "react-icons/bi";
import { MdOutlineDescription, MdOutlineLocalShipping } from "react-icons/md";
import { LuLeaf } from "react-icons/lu";
import { IoWarningOutline } from "react-icons/io5";

interface ProductDetailsProps {
  description: string;
  ingredients?: string[];
  benefits?: Array<{
    title: string;
    description: string;
  }>;
}

interface AccordionLabelProps {
  label: string;
  icon: React.ReactNode;
}

const AccordionLabel = ({ label, icon }: AccordionLabelProps) => {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xl text-primary-500">{icon}</span>
      <span className="font-medium text-gray-700">{label}</span>
    </div>
  );
};

const ProductDetails = ({
  description,
  ingredients = [],
}: ProductDetailsProps) => {
  return (
    <div className="mt-8 border-t pt-6 ">
      <Accordion variant="separated" radius="md">
        <Accordion.Item value="ingredients">
          <Accordion.Control>
            <AccordionLabel label="İçindekiler" icon={<BiPackage />} />
          </Accordion.Control>
          <Accordion.Panel>
            <div className="prose prose-sm text-gray-600">
              <ul className="space-y-2">
                {ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-primary-500">
                * Tüm içeriklerimiz doğal ve sertifikalıdır.
              </p>
            </div>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="description">
          <Accordion.Control>
            <AccordionLabel
              label="Ürün Detayı"
              icon={<MdOutlineDescription />}
            />
          </Accordion.Control>
          <Accordion.Panel>
            <div className="prose prose-sm text-gray-600">
              <p>{description}</p>
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-gray-700">
                  Kullanım Önerileri:
                </h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Temiz cilde uygulayın</li>
                  <li>Günde 2 kez kullanın</li>
                  <li>Güneş kremi ile birlikte kullanın</li>
                </ul>
              </div>
            </div>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="shipping">
          <Accordion.Control>
            <AccordionLabel
              label="Kargo & İade"
              icon={<MdOutlineLocalShipping />}
            />
          </Accordion.Control>
          <Accordion.Panel>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MdOutlineLocalShipping className="text-xl text-primary-500 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-700">Kargo Bilgileri</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    2-3 iş günü içinde kargoya verilir.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <IoWarningOutline className="text-xl text-primary-500 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-700">İade Koşulları</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    14 gün içinde iade hakkınız bulunmaktadır. Ürün açılmamış ve
                    kullanılmamış olmalıdır.
                  </p>
                </div>
              </div>
            </div>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default ProductDetails;
