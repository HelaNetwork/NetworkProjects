import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mainnet, arbitrum, base, baseSepolia } from "@reown/appkit/networks";

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || "b56e464e7bd741240a12e6c51480f2b2"; // Reown AppKit demo ID

export const networks = [baseSepolia, base, mainnet, arbitrum] as [any, ...any[]];

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;
