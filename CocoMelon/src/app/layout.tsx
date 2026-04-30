import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/navbar";
import { AnimatedBackground } from "@/components/animated-background";

export const metadata: Metadata = {
  title: "HelaMatch - Privacy-First Decentralized Dating",
  description:
    "A futuristic dating dApp powered by zero-knowledge proofs and the Hela blockchain. Your privacy, your matches, your data.",
  keywords: ["dating", "dApp", "blockchain", "zero-knowledge", "privacy", "Hela"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Providers>
          <AnimatedBackground />
          <Navbar />
          <main className="relative z-10 pt-16 md:pt-20 pb-20 md:pb-8 min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
