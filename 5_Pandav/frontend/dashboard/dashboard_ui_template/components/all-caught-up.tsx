import { ShieldCheck, Check } from "lucide-react"

export function AllCaughtUp() {
  return (
    <div className="glass relative flex flex-col items-center overflow-hidden rounded-2xl px-6 py-16 text-center">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(34,197,94,0.18), transparent 70%)",
        }}
      />

      {/* Shield graphic */}
      <div className="relative">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-success/25 bg-success/5">
          <ShieldCheck className="h-12 w-12 text-success" strokeWidth={1.75} />
          {/* Concentric rings */}
          <span
            aria-hidden
            className="absolute -inset-3 rounded-[28px] border border-success/15"
          />
          <span
            aria-hidden
            className="absolute -inset-6 rounded-[32px] border border-success/10"
          />
          <span
            aria-hidden
            className="absolute -inset-10 rounded-[40px] border border-success/5"
          />
        </div>
        {/* Check ping */}
        <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-success ring-4 ring-background">
          <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
        </div>
      </div>

      <h3 className="relative mt-8 text-xl font-semibold tracking-tight text-foreground">
        All Caught Up
      </h3>
      <p className="relative mt-2 max-w-md text-sm text-muted-foreground text-pretty">
        No pending intents require guardian review. The network is secure and all
        autonomous agents are operating within approved risk parameters.
      </p>

      <div className="relative mt-6 inline-flex items-center gap-2 rounded-full border border-success/25 bg-success/5 px-3 py-1.5">
        <span className="relative flex h-2 w-2 items-center justify-center">
          <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-success opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
        <span className="text-xs font-medium text-success">Guardian monitor active</span>
      </div>
    </div>
  )
}
