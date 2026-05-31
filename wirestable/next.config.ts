import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use webpack for build (needed for Circle SDK compatibility)
  // Turbopack is Next.js 16 default but Circle packages need webpack resolve
  turbopack: {},
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    // Handle ESM packages
    config.externals = [...(config.externals || []), "pino-pretty", "encoding"];
    return config;
  },
  transpilePackages: [
    "@circle-fin/app-kit",
    "@circle-fin/adapter-viem-v2",
  ],
};

export default nextConfig;
