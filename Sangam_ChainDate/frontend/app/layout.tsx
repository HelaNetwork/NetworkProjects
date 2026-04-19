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
  title: "Sangam — Privacy-First Onchain Dating",
  description: "The world's first fully on-chain, ZK-private dating dApp on Hela Network. Swipe, match, and connect without exposing your identity.",
  keywords: ["blockchain", "dating", "ZK proof", "Hela Network", "Web3", "dApp", "privacy"],
  openGraph: {
    title: "Sangam",
    description: "Swipe, match, and connect on-chain with ZK privacy.",
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
            <Footer />
          </ToastProvider>
        </WalletProvider>
      </body>
    </html>
  );
}





