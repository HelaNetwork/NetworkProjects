import { LucideIcon } from "lucide-react";

interface NewStatsCardProps {
    title: string;
    value: string;
    subtitle?: string;
    icon: LucideIcon;
    gradient: string; // e.g. "bg-emerald-500"
}

export function NewStatsCard({ title, value, subtitle, icon: Icon, gradient }: NewStatsCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/[0.07]">
            <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full ${gradient} opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40`} />

            <div className="relative flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-zinc-400">{title}</p>
                    <div className="mt-2 flex items-baseline gap-1">
                        <h3 className="text-2xl font-bold tracking-tight text-white">{value}</h3>
                    </div>
                    {subtitle && <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>}
                </div>
                <div className={`rounded-xl border border-white/10 bg-white/5 p-2.5 text-zinc-400 ring-1 ring-white/5 transition-colors group-hover:text-white ${gradient.replace('bg-', 'text-emerald-').replace('500', '400')}`}>
                    {/* Hacky color replace or just pass text color? Let's just use white on hover */}
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}
