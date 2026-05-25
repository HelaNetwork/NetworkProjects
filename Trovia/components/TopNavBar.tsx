"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletConnect } from "./WalletConnect";

const NAV_LINKS = [
  { label: "HOME", href: "/" },
  { label: "MARKETPLACE", href: "/marketplace" },
  { label: "DASHBOARD", href: "/dashboard" },
  { label: "PUBLISH", href: "/publish" },
  { label: "ABOUT", href: "/about" },
  { label: "PRICING", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
  { label: "ROADMAP", href: "/roadmap" }
];

export function TopNavBar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path || (path !== "/" && pathname.startsWith(path));

  return (
    <nav className="fixed left-0 top-0 z-50 flex w-full items-center justify-between border-b border-white/12 bg-black px-8 py-4 text-sm tracking-tight text-white">
      <Link href="/" className="flex flex-col text-lg font-bold leading-none text-white">
        <span className="text-xs opacity-60">DECENTRALIZED</span>
        <span className="font-headline text-xl tracking-wider">TROVIA</span>
      </Link>

      <div className="hidden items-center gap-6 text-xs font-bold uppercase md:flex">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`pb-1 transition-all duration-75 ${
              isActive(link.href)
                ? "border-b-2 border-white text-white hover:opacity-80"
                : "text-white/60 hover:text-white hover:opacity-80"
            }`}
          >
            [ {link.label} ]
          </Link>
        ))}
      </div>

      <WalletConnect />
    </nav>
  );
}
