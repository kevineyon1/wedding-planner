import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "30mb", // cukup untuk upload PDF/gambar brosur vendor berukuran besar
    },
  },
};

export default nextConfig;
