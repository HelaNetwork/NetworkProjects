import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(a: string) {
  if (!a || a.length < 10) return a;
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export function parseWeiInput(eth: string): bigint {
  const n = parseFloat(eth);
  if (Number.isNaN(n) || n < 0) return 0n;
  return BigInt(Math.floor(n * 1e18));
}
