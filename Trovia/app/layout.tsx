import type { Metadata } from "next";
import "./globals.css";
import ClientParticles from "@/components/ClientParticles";

export const metadata: Metadata = {
  title: "Trovia - AI Agent Marketplace",
  description: "Decentralized marketplace for AI agents on HeLa Chain",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-black">
        <ClientParticles />
        {children}
      </body>
    </html>
  );
}
