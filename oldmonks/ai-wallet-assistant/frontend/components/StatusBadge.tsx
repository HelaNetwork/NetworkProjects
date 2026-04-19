"use client";

import { Status } from "@/lib/history";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusStyles: Record<Status, { bg: string; text: string; shadow: string }> = {
  Safe: {
    bg: "#00e676",
    text: "black",
    shadow: "#00a854"
  },
  Warning: {
    bg: "#ffd600",
    text: "black",
    shadow: "#cca800"
  },
  Critical: {
    bg: "#ff3b3b",
    text: "white",
    shadow: "#cc0000"
  }
};

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const style = statusStyles[status];

  return (
    <div
      className={className}
      style={{
        padding: '0.5rem 1rem',
        backgroundColor: style.bg,
        color: style.text,
        border: '3px solid black',
        fontWeight: '900',
        fontSize: '0.875rem',
        textTransform: 'uppercase',
        fontFamily: '"Arial Black", sans-serif',
        boxShadow: `4px 4px 0 ${style.shadow}`,
        display: 'inline-block',
        transition: 'all 0.1s'
      }}
    >
      {status} RISK
    </div>
  );
}

