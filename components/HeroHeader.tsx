import { Container, Title, Text, Button } from "@mantine/core";
import { cache } from "react";
import classes from "./modules/HeroHeader.module.css";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const feedHerod = cache(async () => {
  return await prisma.mainHeroSection.findFirst({
    select: {
      title: true,
      buttonLink: true,
      buttonTitle: true,
      text: true,
      image: {
        select: {
          url: true,
        },
      },
    },
  });
});

export async function HeroHeader() {
  const feedHero = await feedHerod();

  return (
    <div className={classes.root}>
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className={classes.backgroundVideo}
      >
        <source
          src={`http://localhost:3000/api/user/asset/get-video?url=${encodeURIComponent(
            feedHero.image.url
          )}`}
          type="video/mp4"
        />
      </video>

      {/* Overlay ve İçerik */}
      <div className={classes.overlay}></div>
      <Container size="lg">
        <div className={classes.inner}>
          <div className={classes.content}>
            <Title className={classes.title}>{feedHero.title}</Title>
            <Text className={classes.description} mt={30}>
              {feedHero.text}
            </Text>
            <Button
              variant="gradient"
              gradient={{ from: "primary", to: "secondary" }}
              size="xl"
              component={Link}
              href={feedHero.buttonLink}
              className={classes.control}
              mt={40}
            >
              {feedHero.buttonTitle}{" "}
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
