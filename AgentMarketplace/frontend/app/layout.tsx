import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/context/WalletContext";
import { ToastProvider } from "@/context/ToastContext";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SmartMP — AI Agent Marketplace on HeLa",
  description: "The premier decentralized marketplace for specialized AI agents. Hire trading bots, personal assistants, and yield farmers on the HeLa Network.",
  keywords: ["blockchain", "AI agents", "smart contracts", "Hela Network", "Web3", "dApp", "marketplace"],
  openGraph: {
    title: "SmartMP",
    description: "Your Autonomous Digital Workforce on HeLa Network.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="antialiased bg-[var(--bg-color)] text-gray-900 min-h-screen font-sans flex flex-col">
        <WalletProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </WalletProvider>
      </body>
    </html>
  );
}





