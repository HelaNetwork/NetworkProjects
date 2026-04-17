"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

const sizeMap = {
  sm: { box: 36, icon: 32, text: "text-base" },
  md: { box: 44, icon: 40, text: "text-lg" },
  lg: { box: 52, icon: 48, text: "text-xl" },
};

/** FindHunt wordmark + unique mark: target ring + rising path (find → track → hunt). */
export function FindHuntLogo({
  size = "md",
  showWordmark = true,
  className,
  animated = false,
  hideWordmarkMobile = true,
}: {
  size?: Size;
  showWordmark?: boolean;
  className?: string;
  animated?: boolean;
  /** Hide “FindHunt” text on very narrow screens; icon stays visible */
  hideWordmarkMobile?: boolean;
}) {
  const { box, icon, text } = sizeMap[size];
  const Mark = (
    <svg
      width={icon}
      height={icon}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden
    >
      <defs>
        <linearGradient id="fh-a" x1="8" y1="40" x2="40" y2="8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#059669" />
          <stop offset="1" stopColor="#14b8a6" />
        </linearGradient>
        <linearGradient id="fh-b" x1="4" y1="24" x2="44" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34d399" stopOpacity="0.35" />
          <stop offset="1" stopColor="#2dd4bf" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#fh-a)" />
      <circle cx="24" cy="22" r="10" stroke="white" strokeWidth="2.2" strokeOpacity="0.95" fill="none" />
      <circle cx="24" cy="22" r="3" fill="white" fillOpacity="0.95" />
      <path
        d="M10 34 Q18 28 24 26 T38 14"
        stroke="url(#fh-b)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M32 14 L38 14 L38 20" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );

  const inner = (
    <div className="flex items-center gap-2">
      <span
        className="flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 shadow-lg shadow-emerald-600/25"
        style={{ width: box, height: box }}
      >
        {Mark}
      </span>
      {showWordmark && (
        <span
          className={cn(
            "font-bold tracking-tight text-slate-900 dark:text-white",
            text,
            hideWordmarkMobile && "hidden sm:inline"
          )}
        >
          <span className="text-emerald-600 dark:text-emerald-400">Find</span>
          <span className="text-slate-700 dark:text-slate-200">Hunt</span>
        </span>
      )}
    </div>
  );

  if (animated) {
    return (
      <motion.div className={className} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        {inner}
      </motion.div>
    );
  }

  return <div className={className}>{inner}</div>;
}
