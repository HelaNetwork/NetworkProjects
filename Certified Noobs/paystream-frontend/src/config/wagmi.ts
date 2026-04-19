"use client";

import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { helaTestnet } from "./chains";

const PAYSTREAM_ADDRESS = (process.env.NEXT_PUBLIC_PAYSTREAM_ADDRESS || "") as `0x${string}`;
const HLUSD_ADDRESS = (process.env.NEXT_PUBLIC_HLUSD_ADDRESS || "") as `0x${string}`;

export const config = createConfig({
  chains: [helaTestnet],
  connectors: [injected()],
  transports: {
    [helaTestnet.id]: http(),
  },
});

export { PAYSTREAM_ADDRESS, HLUSD_ADDRESS };
