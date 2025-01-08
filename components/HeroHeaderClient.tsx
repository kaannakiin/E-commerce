"use client";

import { Carousel } from "@mantine/carousel";
import { Button, Container, Text, Title } from "@mantine/core";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import { useRef } from "react";
import CustomImage from "./CustomImage";
import { useMediaQuery } from "@mantine/hooks";
import { match } from "assert";
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
  const autoplay = useRef(Autoplay({ delay: 1000, active: true }));
  const matches = useMediaQuery("(min-width: 56.25em)");

  return (
    <Carousel
      withIndicators
      withControls={false}
      height={matches ? 800 : 400}
      loop
      plugins={[autoplay.current as never]}
      onMouseEnter={autoplay.current.stop}
      onMouseLeave={autoplay.current.reset}
      classNames={{ indicator: styles.indicator }}
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
    >
      {items.map((item, index) => (
        <Carousel.Slide key={index}>
          <div className="relative h-full w-full">
            <div className="absolute inset-0">
              {item.type === "VIDEO" ? (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                >
                  <source
                    src={`http://localhost:3000/api/user/asset/get-video?url=${encodeURIComponent(item.image.url)}`}
                    type="video/mp4"
                  />
                </video>
              ) : (
                <CustomImage
                  src={`${item.image.url}`}
                  alt={item.alt}
                  objectFit="cover"
                  priority
                />
              )}
            </div>

            {item.isFunctionality && (
              <Container size="lg" className="relative h-full">
                <div className="flex h-full flex-col justify-center">
                  <div className="max-w-2xl">
                    {item.title && (
                      <Title className="text-5xl font-bold leading-tight text-white">
                        <Text
                          component="span"
                          inherit
                          variant="gradient"
                          gradient={{ from: "pink", to: "yellow" }}
                        >
                          {item.title}
                        </Text>
                      </Title>
                    )}
                    {item.text && (
                      <Text className="mt-8 text-xl text-white/90">
                        {item.text}
                      </Text>
                    )}
                    {item.buttonTitle && (
                      <Button
                        component={Link}
                        href={item.buttonLink}
                        variant="gradient"
                        gradient={{ from: "pink", to: "yellow" }}
                        size="xl"
                        className="mt-10"
                      >
                        {item.buttonTitle}
                      </Button>
                    )}
                  </div>
                </div>
              </Container>
            )}
          </div>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}
