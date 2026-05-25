import type { Metadata, Viewport } from "next"
import { Outfit, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { WalletProvider } from "@/components/wallet-provider"
import { DashboardShell } from "@/components/dashboard-shell"
import "./globals.css"

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "TAAP — Trustworthy Autonomous Agent Protocol",
  description:
    "Guardian-grade oversight for autonomous AI agents. Intercept, assess, and verify high-risk agent intents on-chain.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${geistMono.variable} dark`}>
      <body className="bg-background font-sans antialiased">
        <WalletProvider>
          <DashboardShell>{children}</DashboardShell>
        </WalletProvider>
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "rgba(18, 18, 20, 0.85)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "#fafafa",
            },
          }}
        />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
