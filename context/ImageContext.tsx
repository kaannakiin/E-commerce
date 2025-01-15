"use client";
import { readAllImageSecureUrl } from "@/app/(admin)/admin/blog/_actions/BlogAction";
import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface ImageContextProps {
  children: ReactNode;
}

interface ContextProps {
  images: string[];
  updateImages(images: string[]): void;
  removeOldImage(secureUrl: string): void;
}

const Context = createContext<ContextProps | null>(null);

const ImageProvider: FC<ImageContextProps> = ({ children }) => {
  const [images, setImages] = useState<string[]>([]);

  const updateImages = (data: string[]) => {
    setImages((prevImages) => {
      const newUniqueImages = data.filter((url) => !prevImages.includes(url));
      return [...newUniqueImages, ...prevImages];
    });
  };

  const removeOldImage = (secureUrl: string) => {
    setImages((old) => old.filter((img) => secureUrl !== img));
  };

  useEffect(() => {
    readAllImageSecureUrl().then(setImages);
  }, []);

  return (
    <Context.Provider value={{ images, updateImages, removeOldImage }}>
      {children}
    </Context.Provider>
  );
};

export const useImages = () => useContext(Context);
export default ImageProvider;
