import React, { cache } from "react";
import { IoShieldCheckmarkOutline } from "react-icons/io5";
import { FaTruckMoving } from "react-icons/fa";
import { FaTurkishLiraSign } from "react-icons/fa6";
import CustomImage from "./CustomImage";
import { prisma } from "@/lib/prisma";

const feedPage = cache(async () => {
  try {
    const data = await prisma.altSectionImage.findMany({
      where: {
        isActive: true,
      },
      select: {
        color: true,
        image: true,
        text: true,
        isActive: true,
        title: true,
      },
      take: 3,
    });
    if (!data) return null;
    return data;
  } catch (error) {
    return null;
  }
});

const AltSectionImages = async () => {
  const data = await feedPage();

  const defaultFeatures = [
    {
      Icon: IoShieldCheckmarkOutline,
      title: "Güvenli Alışveriş",
      text: "7/24 güvenli alışveriş deneyimi ve müşteri desteği sunuyoruz.",
      color: "text-black",
    },
    {
      Icon: FaTurkishLiraSign,
      title: "Uygun Fiyat",
      text: "En kaliteli ürünleri en uygun fiyatlarla sizlere sunuyoruz.",
      color: "text-black",
    },
    {
      Icon: FaTruckMoving,
      title: "Hızlı Teslimat",
      text: "Türkiye'nin her yerine hızlı ve güvenli teslimat yapıyoruz.",
      color: "text-black",
    },
  ];

  return (
    <div className="container px-2 py-8 md:px-4 md:py-16">
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        {defaultFeatures.map((defaultFeature, idx) => {
          const feature = data?.[idx];
          const DefaultIcon = defaultFeature.Icon;

          return (
            <div key={idx} className="px-2 text-center md:px-6">
              <div className="mx-auto mb-2 h-8 w-8 md:mb-4 md:h-16 md:w-16">
                {feature?.image ? (
                  <CustomImage
                    src={feature.image.url}
                    quality={20}
                    objectFit="contain"
                    sizes="100vw"
                  />
                ) : (
                  <DefaultIcon
                    className={`${defaultFeature.color} h-full min-h-full w-full min-w-full`}
                  />
                )}
              </div>
              <h3 className="mb-1 text-sm font-semibold md:mb-3 md:text-xl">
                {feature?.title || defaultFeature.title}
              </h3>
              <p className="text-xs text-gray-600 md:text-base md:leading-relaxed">
                {feature?.text || defaultFeature.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AltSectionImages;
