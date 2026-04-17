"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/register", label: "Register", icon: "✍️" },
  { href: "/swipe", label: "Swipe", icon: "❤️" },
  { href: "/matches", label: "Matches", icon: "💬" },
];

export default function Footer() {
  const pathname = usePathname();

  return (
    <footer className="w-full mt-auto">
      {/* Mobile bottom nav bar (app-style) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-rose-100 shadow-2xl shadow-rose-100/60 safe-area-pb">
        <div className="flex items-stretch">
          {NAV_LINKS.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 text-[11px] font-bold transition-all ${
                  isActive
                    ? "text-rose-500 bg-rose-50"
                    : "text-gray-400 hover:text-rose-400"
                }`}
              >
                <span className="text-xl leading-none">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop footer */}
      <div className="hidden md:block border-t border-rose-100/80 bg-white/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Logo */}
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💜</span>
              <span className="font-black text-xl gradient-text tracking-tight">Sangam</span>
              <p className="text-xs text-gray-400 ml-3 hidden sm:block">ZK-private dating on Hela Network</p>
            </div>

            {/* Big nav buttons */}
            <div className="flex gap-3 flex-wrap">
              {NAV_LINKS.map(link => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-sm transition-all border ${
                      isActive
                        ? "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-200"
                        : "bg-white text-gray-700 border-gray-200 hover:border-rose-400 hover:text-rose-500 hover:bg-rose-50"
                    }`}
                  >
                    <span>{link.icon}</span>
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Bottom row */}
          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-2 flex-wrap">
              <span className="text-[11px] bg-rose-50 border border-rose-200 text-rose-600 px-3 py-1 rounded-full font-semibold">
                ⛓️ Hela Network (666888)
              </span>
              <span className="text-[11px] bg-violet-50 border border-violet-200 text-violet-600 px-3 py-1 rounded-full font-semibold">
                🔐 ZK Proofs
              </span>
              <span className="text-[11px] bg-emerald-50 border border-emerald-200 text-emerald-600 px-3 py-1 rounded-full font-semibold">
                🛡️ Privacy First
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Built with 💜 for <span className="text-rose-500 font-semibold">HackJKLU v5.0</span> · © 2026 Sangam
            </p>
          </div>
        </div>
      </div>

      {/* Spacer on mobile so content isn't hidden behind the fixed nav */}
      <div className="md:hidden h-20" />
    </footer>
  );
}
