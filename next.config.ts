import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  sassOptions: {
    prependData: `@import "./_mantine.scss";`,
  },
};

export default nextConfig;
