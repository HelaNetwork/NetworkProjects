"use client";

import { Status } from "@/lib/history";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusStyles: Record<Status, string> = {
  Safe: "bg-[#00ff00] text-black border-black shadow-[4px_4px_0_black]",
  Warning: "bg-[#ffff00] text-black border-black shadow-[4px_4px_0_black]",
  Critical: "bg-[#ff0000] text-white border-black shadow-[4px_4px_0_black]"
};

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <div 
      className={`
        px-4 py-2 border-4 font-black text-sm uppercase tracking-wide
        inline-block transition-all duration-150
        ${statusStyles[status]} ${className}
      `}
      style={{ fontFamily: '"Arial Black", sans-serif' }}
    >
      {status} RISK
    </div>
  );
}
