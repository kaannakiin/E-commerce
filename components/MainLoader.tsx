import { LoadingOverlay } from "@mantine/core";
import React from "react";

interface MainLoaderProps {
  type?: "dots" | "bars" | "oval";
  opacity?: number;
}

const MainLoader = ({ type = "oval", opacity = 0.7 }: MainLoaderProps) => {
  return (
    <LoadingOverlay
      visible
      zIndex={1000}
      overlayProps={{ opacity }}
      loaderProps={{ type: type, color: "primary", size: "lg" }}
    />
  );
};

export default MainLoader;
