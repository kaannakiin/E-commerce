import { LoadingOverlay } from "@mantine/core";
import React from "react";

interface MainLoaderProps {
  type?: "dots" | "bars" | "oval";
}

const MainLoader = ({ type = "dots" }: MainLoaderProps) => {
  return (
    <LoadingOverlay
      visible
      zIndex={1000}
      overlayProps={{ opacity: 0.7 }}
      loaderProps={{ type: type, color: "primary", size: "lg" }}
    />
  );
};

export default MainLoader;
