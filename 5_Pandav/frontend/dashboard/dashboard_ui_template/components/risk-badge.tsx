import { cn } from "@/lib/utils"

type Level = "low" | "medium" | "high"

function getLevel(score: number): Level {
  if (score <= 4) return "low"
  if (score <= 7) return "medium"
  return "high"
}

const styles: Record<Level, string> = {
  low: "border-success/30 bg-success/10 text-success",
  medium: "border-warning/30 bg-warning/10 text-warning",
  high: "border-destructive/30 bg-destructive/10 text-destructive",
}

const dotStyles: Record<Level, string> = {
  low: "bg-success",
  medium: "bg-warning",
  high: "bg-destructive",
}

const labels: Record<Level, string> = {
  low: "LOW",
  medium: "ELEVATED",
  high: "CRITICAL",
}

export function RiskBadge({ score, size = "md" }: { score: number; size?: "sm" | "md" }) {
  const level = getLevel(score)
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-md border font-mono font-medium tracking-tight",
        styles[level],
        size === "md" ? "px-2.5 py-1 text-[11px]" : "px-2 py-0.5 text-[10px]",
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotStyles[level])} />
      <span className="uppercase tracking-[0.08em]">{labels[level]}</span>
      <span className="text-foreground/90">
        {score}<span className="opacity-50">/10</span>
      </span>
    </div>
  )
}

export function getRiskLevel(score: number) {
  return getLevel(score)
}
