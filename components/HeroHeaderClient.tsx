"use client";

import { Carousel } from "@mantine/carousel";
import { useMediaQuery } from "@mantine/hooks";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import CustomImage from "./CustomImage";
import styles from "./modules/HeroHeader.module.css";

interface HeroItem {
  alt: string;
  isPublished: boolean;
  type: "IMAGE" | "VIDEO";
  isFunctionality: boolean;
  title: string;
  buttonLink: string;
  buttonTitle: string;
  text: string;
  image: {
    url: string;
  };
}

interface HeroCarouselProps {
  items: HeroItem[];
}

export function HeroCarousel({ items }: HeroCarouselProps) {
  const autoplay = useRef(Autoplay({ delay: 2000, active: true }));

  return (
    <div className="w-full">
      <Carousel
        plugins={[autoplay.current as never]}
        onMouseEnter={autoplay.current.stop}
        onMouseLeave={autoplay.current.reset}
        classNames={{
          root: "w-full",
          viewport: "w-full",
          container: "w-full",
          slide: "w-full aspect-[16/9] md:aspect-[21/9]",
          indicator: styles.indicator,
        }}
        styles={{
          indicators: {
            width: "100%",
            gap: 0,
            marginTop: 0,
            bottom: 0,
          },
          indicator: {
            width: `${100 / items.length}%`,
            height: 8,
            transition: "all 250ms ease",
            borderRadius: 0,
            backgroundColor: "#E5E7EB ",
          },
        }}
        withIndicators
        withControls={false}
        loop
      >
        {items.map((item, index) => (
          <Carousel.Slide key={index}>
            <div className="relative h-full w-full">
              <CustomImage
                src={item?.image?.url}
                alt="Banner image"
                className="h-full w-full object-fill"
                sizes="100vw"
              />
            </div>
          </Carousel.Slide>
        ))}
      </Carousel>
    </div>
  );
}
