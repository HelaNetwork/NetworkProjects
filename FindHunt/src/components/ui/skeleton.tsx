import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-xl bg-gradient-to-r from-slate-200/90 via-emerald-100/70 to-slate-200/90 bg-[length:200%_100%] dark:from-slate-800 dark:via-emerald-900/40 dark:to-slate-800",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
