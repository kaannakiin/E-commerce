"use client";
import ImageProvider from "@/context/ImageContext";
import { ReactNode, FC } from "react";
interface ImageProviderProps {
  children: ReactNode;
}
const Provider: FC<ImageProviderProps> = ({ children }) => {
  return <ImageProvider>{children}</ImageProvider>;
};

export default Provider;
