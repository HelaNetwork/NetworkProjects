import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Web3Providers } from "@/components/providers/web3-providers";
import { AppShell } from "@/components/layout/app-shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FindHunt · Crypto finance & trading agent",
  description:
    "FindHunt — SIP-style crypto plans, subscriptions & auto-bills (Netflix, SaaS, GPT), rent & school fees, trading charts, P&L, and Hela wallet tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Web3Providers>
          <AppShell>{children}</AppShell>
        </Web3Providers>
      </body>
    </html>
  );
}
