"use client";
import { Modal, useMantineTheme } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useState } from "react";
import CustomImage from "./CustomImage";

const ProductGallery = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [opened, { open, close }] = useDisclosure(false);
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div
        className="relative aspect-[11/19] w-full overflow-hidden rounded-lg lg:aspect-[11/7]"
        onClick={open}
      >
        <CustomImage
          src={images[selectedImage]}
          quality={80}
          objectFit="contain"
        />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`relative aspect-[7/4] overflow-hidden rounded-lg ${
              selectedImage === index
                ? "ring-2 ring-blue-500"
                : "ring-1 ring-gray-200"
            } transition-all duration-200 hover:ring-blue-300`}
          >
            <CustomImage src={image} quality={21} objectFit="cover" />
          </button>
        ))}
      </div>
      <Modal
        opened={opened}
        onClose={close}
        transitionProps={{
          transition: "fade",
          duration: 200,
          timingFunction: "linear",
        }}
        withCloseButton={false}
        fullScreen
      >
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="relative h-full w-full bg-gray-50">
            <CustomImage
              src={images[selectedImage]}
              quality={40}
              objectFit="contain"
            />

            {/* Navigation Buttons with Close Button */}
            <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 transform gap-4">
              <button
                onClick={() =>
                  setSelectedImage((prev) =>
                    prev === 0 ? images.length - 1 : prev - 1,
                  )
                }
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow-lg backdrop-blur-sm transition hover:bg-white hover:text-blue-600"
                aria-label="Previous image"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              </button>

              {/* Close Button */}
              <button
                onClick={close}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow-lg backdrop-blur-sm transition hover:bg-white hover:text-red-600"
                aria-label="Close modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <button
                onClick={() =>
                  setSelectedImage((prev) =>
                    prev === images.length - 1 ? 0 : prev + 1,
                  )
                }
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow-lg backdrop-blur-sm transition hover:bg-white hover:text-blue-600"
                aria-label="Next image"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            </div>
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 transform rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-gray-800 shadow-lg backdrop-blur-sm">
              {selectedImage + 1} / {images.length}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductGallery;
