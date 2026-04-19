import { useQuery } from "@tanstack/react-query";
import { getExchangeState, getMatches, getMarkets } from "@/lib/api";
import { Users, Coins, Swords, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const { data: state } = useQuery({ queryKey: ["exchange-state"], queryFn: getExchangeState });
  const { data: matchesData } = useQuery({ queryKey: ["matches"], queryFn: getMatches });
  const { data: marketsData } = useQuery({ queryKey: ["markets"], queryFn: getMarkets });

  const stats = [
    { label: "Teams", value: state?.teams ?? "—", icon: Users, color: "text-neon-green" },
    { label: "Assets", value: state?.assets ?? "—", icon: Coins, color: "text-neon-cyan" },
    { label: "Matches", value: state?.matches ?? "—", icon: Swords, color: "text-neon-purple" },
    { label: "Markets", value: state?.markets ?? "—", icon: TrendingUp, color: "text-neon-orange" },
  ];

  const recentMatches = matchesData?.data?.slice(0, 5) ?? [];
  const openMarkets = marketsData?.data?.filter((m) => m.status === "OPEN")?.slice(0, 5) ?? [];

  return (
    <div>
      <h1 className="text-3xl font-display mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className={`text-3xl font-display font-bold mt-1 ${color}`}>{value}</p>
              </div>
              <Icon className={`h-8 w-8 ${color} opacity-50`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-lg font-display mb-4">Recent Matches</h2>
          {recentMatches.length === 0 ? (
            <p className="text-muted-foreground text-sm">No matches yet</p>
          ) : (
            <div className="space-y-3">
              {recentMatches.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <span className="text-sm font-medium">{m.teamA?.name ?? "?"} vs {m.teamB?.name ?? "?"}</span>
                    <p className="text-xs text-muted-foreground">{m.tournament}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    m.status === "SCHEDULED" ? "bg-neon-cyan/10 text-neon-cyan" :
                    m.status === "FINISHED" ? "bg-neon-green/10 text-neon-green" : "bg-secondary text-muted-foreground"
                  }`}>
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-display mb-4">Open Markets</h2>
          {openMarkets.length === 0 ? (
            <p className="text-muted-foreground text-sm">No open markets</p>
          ) : (
            <div className="space-y-3">
              {openMarkets.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <span className="text-sm font-medium">
                      {m.match?.teamA?.name ?? "?"} vs {m.match?.teamB?.name ?? "?"}
                    </span>
                    <p className="text-xs text-muted-foreground">Liquidity: {m.liquidityPool}</p>
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-neon-green">{m.teamAPrice?.toFixed(2) ?? "—"}</span>
                    <span className="text-muted-foreground mx-1">/</span>
                    <span className="text-neon-orange">{m.teamBPrice?.toFixed(2) ?? "—"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
