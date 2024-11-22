import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  sassOptions: {
    prependData: `@import "./_mantine.scss";`,
  },
  
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http", hostname: "localhost", port: "3000" },
    ],
  },
  webpack: (config, { isServer }) => {
    config.watchOptions = {
      poll: 1000, // Her saniye kontrol et
      aggregateTimeout: 500, // Değişikliklerden sonra beklenecek süre (ms)
      ignored: ["**/node_modules", "**/.next"], // Bu klasörleri izleme
    };

    return config;
  },
};

export default nextConfig;
