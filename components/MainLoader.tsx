import { LoadingOverlay } from "@mantine/core";
import React from "react";

const MainLoader = () => {
  return (
    <LoadingOverlay
      visible
      zIndex={1000}
      overlayProps={{ opacity: 0.7 }}
      loaderProps={{ type: "dots", color: "primary", size: "lg" }}
    />
  );
};

export default MainLoader;
