"use client";

import { useState } from "react";
import { Carousel } from "@mantine/carousel";
import { Container, Title, Text, Button } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";

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
  return (
    <Carousel
      withIndicators
      height={600}
      loop
      styles={{
        indicator: {
          width: 12,
          height: 4,
          transition: "width 250ms ease",
          "&[dataActive]": {
            width: 40,
          },
        },
      }}
    >
      {items.map((item, index) => (
        <Carousel.Slide key={index}>
          <div className="relative h-full w-full">
            {/* Media Content */}
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
                <Image
                  src={`/api/user/asset/get-image?url=${encodeURIComponent(item.image.url)}`}
                  alt={item.alt}
                  fill
                  className="object-cover"
                  priority
                />
              )}
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Content */}
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
