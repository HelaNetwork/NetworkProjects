"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { IconBuilding, IconUsers } from "./Icons";
import { PayStreamLogo } from "./Logo";

const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/hr", label: "HR Dashboard", icon: IconBuilding },
    { href: "/employee", label: "Employee Portal", icon: IconUsers },
];

export function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--bg-primary)]/80 border-b border-[var(--border-default)]">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Brand */}
                <Link href="/" className="flex items-center gap-3 group">
                    <PayStreamLogo size={36} />
                    <span className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                        Pay<span className="text-[var(--accent-light)]">Stream</span>
                    </span>
                </Link>

                {/* Center links */}
                <div className="hidden md:flex items-center gap-1">
                    {NAV_LINKS.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                    ? "bg-[var(--accent)]/10 text-[var(--accent-light)]"
                                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.03]"
                                    }`}
                            >
                                {link.icon && <link.icon size={16} />}
                                {link.label}
                            </Link>
                        );
                    })}
                </div>

                {/* Wallet */}
                <ConnectButton />
            </div>
        </nav>
    );
}
