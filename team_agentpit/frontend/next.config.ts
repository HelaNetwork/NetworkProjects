import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@coinbase/wallet-sdk": false,
      "@metamask/connect-evm": false,
      porto: false,
    };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      accounts: false,
      "porto/internal": false,
      net: false,
      tls: false,
      fs: false,
    };
    return config;
  },
};

export default nextConfig;

