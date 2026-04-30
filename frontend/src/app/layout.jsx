import "./globals.css";
import Web3Provider from "@/providers/Web3Provider";

export const metadata = {
  title: "ShieldAI — Wallet Guardian | AI-Powered Transaction Security",
  description: "AI-powered assistant that helps you understand crypto transactions, assess risks, and make safe decisions before signing. Protect your wallet from scams, unlimited approvals, and malicious contracts.",
  keywords: ["crypto wallet", "transaction security", "blockchain", "AI assistant", "DeFi safety", "Web3 security"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to Google Fonts for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Display font: Space Grotesk | Body font: Inter | Mono: JetBrains Mono */}
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
