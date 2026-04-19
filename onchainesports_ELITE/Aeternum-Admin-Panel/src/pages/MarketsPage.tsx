import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMarkets, getMatches, createMarket, addLiquidity, type Market } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Droplets } from "lucide-react";
import { toast } from "sonner";

export default function MarketsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["markets"], queryFn: getMarkets });
  const { data: matchesData } = useQuery({ queryKey: ["matches"], queryFn: getMatches });
  const [open, setOpen] = useState(false);
  const [liqOpen, setLiqOpen] = useState(false);
  const [liqMarketId, setLiqMarketId] = useState("");
  const [liqAmount, setLiqAmount] = useState("500");
  const [form, setForm] = useState({ matchId: "", basePrice: "1", kFactor: "0.05", initialLiquidity: "1000" });

  const createMutation = useMutation({
    mutationFn: createMarket,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["markets"] }); toast.success("Market created"); setOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  const liqMutation = useMutation({
    mutationFn: addLiquidity,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["markets"] }); toast.success("Liquidity added"); setLiqOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  const markets: Market[] = data?.data ?? [];
  const matches = matchesData?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-display">Markets</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Create Market</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle className="font-display">Create Market</DialogTitle></DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!form.matchId) return toast.error("Select a match");
              createMutation.mutate({
                matchId: form.matchId, basePrice: Number(form.basePrice),
                kFactor: Number(form.kFactor), initialLiquidity: Number(form.initialLiquidity),
              });
            }} className="space-y-4">
              <select value={form.matchId} onChange={e => setForm(f => ({ ...f, matchId: e.target.value }))}
                className="w-full h-10 px-3 rounded-md bg-secondary border border-border text-sm text-foreground">
                <option value="">Select Match</option>
                {matches.map(m => (
                  <option key={m.id} value={m.id}>{m.teamA?.name ?? "?"} vs {m.teamB?.name ?? "?"} — {m.tournament}</option>
                ))}
              </select>
              <div className="grid grid-cols-3 gap-2">
                <Input placeholder="Base Price" type="number" step="0.01" value={form.basePrice} onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))} className="bg-secondary border-border" />
                <Input placeholder="K Factor" type="number" step="0.01" value={form.kFactor} onChange={e => setForm(f => ({ ...f, kFactor: e.target.value }))} className="bg-secondary border-border" />
                <Input placeholder="Init. Liquidity" type="number" value={form.initialLiquidity} onChange={e => setForm(f => ({ ...f, initialLiquidity: e.target.value }))} className="bg-secondary border-border" />
              </div>
              <Button type="submit" disabled={createMutation.isPending} className="w-full">
                {createMutation.isPending ? "Creating..." : "Create Market"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Add Liquidity Dialog */}
      <Dialog open={liqOpen} onOpenChange={setLiqOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="font-display">Add Liquidity</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            liqMutation.mutate({ marketId: liqMarketId, amount: Number(liqAmount) });
          }} className="space-y-4">
            <Input placeholder="Amount" type="number" value={liqAmount} onChange={e => setLiqAmount(e.target.value)} className="bg-secondary border-border" />
            <Button type="submit" disabled={liqMutation.isPending} className="w-full">
              {liqMutation.isPending ? "Adding..." : "Add Liquidity"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : markets.length === 0 ? (
        <p className="text-muted-foreground">No markets yet</p>
      ) : (
        <div className="space-y-3">
          {markets.map((m) => (
            <div key={m.id} className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium">
                    {m.match?.teamA?.name ?? "?"} vs {m.match?.teamB?.name ?? "?"}
                  </span>
                  <p className="text-xs text-muted-foreground">{m.match?.tournament}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    m.status === "OPEN" ? "bg-neon-green/10 text-neon-green" : "bg-secondary text-muted-foreground"
                  }`}>{m.status}</span>
                  {m.status === "OPEN" && (
                    <Button size="sm" variant="outline" onClick={() => { setLiqMarketId(m.id); setLiqOpen(true); }}>
                      <Droplets className="h-3 w-3 mr-1" /> Add Liquidity
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Liquidity</p>
                  <p className="font-display font-bold">{m.liquidityPool}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Supply A/B</p>
                  <p className="font-display font-bold">{m.supplyA}/{m.supplyB}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Price A</p>
                  <p className="font-display font-bold text-neon-green">{m.teamAPrice?.toFixed(2) ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Price B</p>
                  <p className="font-display font-bold text-neon-orange">{m.teamBPrice?.toFixed(2) ?? "—"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
