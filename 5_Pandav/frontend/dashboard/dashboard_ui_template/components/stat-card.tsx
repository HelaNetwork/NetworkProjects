import type { LucideIcon } from "lucide-react"

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  tone = "default",
}: {
  icon: LucideIcon
  label: string
  value: string
  trend?: string
  tone?: "default" | "success" | "warning" | "danger"
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : tone === "danger"
          ? "text-destructive"
          : "text-primary"

  return (
    <div className="glass hover-lift rounded-xl p-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
        <Icon className={`h-4 w-4 ${toneClass}`} strokeWidth={2} />
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-[26px] font-semibold leading-none tracking-tight text-foreground">
          {value}
        </span>
        {trend && <span className="text-xs text-muted-foreground">{trend}</span>}
      </div>
    </div>
  )
}
