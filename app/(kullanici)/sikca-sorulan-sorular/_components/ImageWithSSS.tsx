"use client";
import {
  Accordion,
  BackgroundImage,
  Box,
  Center,
  Stack,
  Text,
  Title,
  TypographyStylesProvider,
} from "@mantine/core";
import { GoPlus } from "react-icons/go";
import { FaqSectionType } from "../page";

const ImageWithSSS = ({ data }: { data: FaqSectionType }) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:gap-8">
      <Box mx="auto" w="100%">
        <BackgroundImage
          h={{ base: 300, sm: 400, md: 500 }}
          src={`${process.env.NEXT_PUBLIC_APP_URL}/api/user/asset/get-image?url=${data?.image?.url}&quality=60`}
          style={{
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
          className="overflow-hidden rounded-lg lg:rounded-none"
        >
          <Center
            p={{ base: "md", sm: "xl" }}
            h="100%"
            bg={"rgba(0, 0, 0, 0.3)"}
          >
            <Stack align="center" gap="md" w="100%">
              <Title order={2} c="white" ta="center" className="text-shadow">
                {data?.title}
              </Title>
              <Text
                c="white"
                ta="center"
                className="text-shadow mx-auto max-w-xl"
              >
                {data?.description}
              </Text>
            </Stack>
          </Center>
        </BackgroundImage>
      </Box>

      <Accordion
        chevronPosition="right"
        defaultValue={data?.questions.length > 0 ? "0" : null}
        variant="default"
        classNames={{
          chevron: "custom-chevron",
        }}
        chevron={<GoPlus size={16} />}
      >
        {data?.questions.map((item, index) => (
          <Accordion.Item key={index} value={index.toString()}>
            <Accordion.Control>{item.question}</Accordion.Control>
            <Accordion.Panel>
              <TypographyStylesProvider className="ProseMirror">
                <div
                  dangerouslySetInnerHTML={{
                    __html: item.answer,
                  }}
                />
              </TypographyStylesProvider>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  );
};

export default ImageWithSSS;
