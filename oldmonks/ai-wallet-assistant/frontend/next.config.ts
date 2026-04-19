import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // 1. Remove problematic externals. ox MUST be bundled.
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    // 2. Safely ignore optional Web3 dependencies without breaking runtime globals
    config.resolve.alias = {
      ...config.resolve.alias,
      'accounts': false,
      'porto': false,
      'porto/internal': false
    };

    return config;
  },
};

export default nextConfig;
