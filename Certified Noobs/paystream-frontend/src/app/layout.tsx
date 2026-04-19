import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Nav } from "@/components/Nav";
import { Background } from "@/components/Background";

export const metadata: Metadata = {
  title: "PayStream — Salary Streaming on HeLa",
  description: "Real-time payroll streaming with HLUSD on HeLa testnet",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <Background />
          <Nav />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
