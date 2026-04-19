"use client";

import { motion, Variants } from "framer-motion";

const floatVariants: Variants = {
  float1: {
    y: [0, -12, 0],
    rotate: [0, 3, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
  float2: {
    y: [0, 10, 0],
    rotate: [0, -4, 0],
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
  },
  float3: {
    y: [0, -8, 0],
    transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
  },
  pulse: {
    scale: [1, 1.08, 1],
    opacity: [0.15, 0.25, 0.15],
    transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
  },
};

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ChainIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function CoinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v12M9 9a9 9 0 0 1 6 0M9 15a9 9 0 0 0 6 0" />
    </svg>
  );
}

function HexagonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2L21 7v10l-9 5-9-5V7l9-5z" />
    </svg>
  );
}

function NodeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20M16 14h.01" />
    </svg>
  );
}

const elements = [
  { Icon: LockIcon, x: "8%", y: "18%", size: 20, variant: "float1", opacity: 0.12 },
  { Icon: ChainIcon, x: "88%", y: "25%", size: 18, variant: "float2", opacity: 0.1 },
  { Icon: CoinIcon, x: "15%", y: "70%", size: 24, variant: "float3", opacity: 0.14 },
  { Icon: HexagonIcon, x: "82%", y: "65%", size: 22, variant: "float1", opacity: 0.1 },
  { Icon: NodeIcon, x: "25%", y: "35%", size: 8, variant: "pulse", opacity: 0.2 },
  { Icon: NodeIcon, x: "75%", y: "45%", size: 6, variant: "pulse", opacity: 0.15 },
  { Icon: WalletIcon, x: "90%", y: "80%", size: 16, variant: "float2", opacity: 0.11 },
  { Icon: LockIcon, x: "5%", y: "50%", size: 14, variant: "float3", opacity: 0.08 },
  { Icon: CoinIcon, x: "70%", y: "15%", size: 16, variant: "float1", opacity: 0.09 },
  { Icon: HexagonIcon, x: "50%", y: "85%", size: 18, variant: "float2", opacity: 0.07 },
];

export function BlockchainFloating() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {elements.map(({ Icon, x, y, size, variant, opacity }, i) => (
        <motion.div
          key={i}
          className="absolute text-[var(--accent)]"
          style={{
            left: x,
            top: y,
            width: size,
            height: size,
            opacity,
          }}
          variants={floatVariants}
          animate={variant}
          transition={{ delay: i * 0.2 }}
        >
          <Icon className="h-full w-full" />
        </motion.div>
      ))}
      {/* Connection lines (network feel) */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.04]" aria-hidden>
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--accent)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="0" y1="30%" x2="40%" y2="30%" stroke="url(#lineGrad)" strokeWidth="0.5" />
        <line x1="60%" y1="70%" x2="100%" y2="70%" stroke="url(#lineGrad)" strokeWidth="0.5" />
        <line x1="20%" y1="0" x2="20%" y2="50%" stroke="var(--accent)" strokeOpacity="0.06" strokeWidth="0.5" />
        <line x1="80%" y1="50%" x2="80%" y2="100%" stroke="var(--accent)" strokeOpacity="0.06" strokeWidth="0.5" />
      </svg>
      {/* Hexagon grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='24' viewBox='0 0 28 24'%3E%3Cpath fill='none' stroke='%2314b8a6' stroke-width='0.5' d='M14 0l7 4v8l-7 4-7-4V4z'/%3E%3Cpath fill='none' stroke='%2314b8a6' stroke-width='0.5' d='M0 12l7 4v8l7-4V8z'/%3E%3Cpath fill='none' stroke='%2314b8a6' stroke-width='0.5' d='M28 12l-7 4v8l-7-4V8z'/%3E%3C/svg%3E")`,
          backgroundSize: "56px 48px",
        }}
      />
    </div>
  );
}
