import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // cukup untuk upload PDF brosur vendor
    },
  },
};

export default nextConfig;
