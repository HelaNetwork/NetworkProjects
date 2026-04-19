import type { Metadata } from "next";
import { Providers } from "../components/Providers";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "PayStream — Salary Streaming on HeLa",
  description:
    "Hackathon-ready salary streaming payroll dApp on HeLa Testnet using HLUSD",
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-gray-950 text-white font-['Inter',sans-serif] antialiased min-h-screen">
        <Providers>
          <Navbar />
          <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
