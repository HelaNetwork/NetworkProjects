import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMatches, getTeams, createMatch, setMatchResult, type Match } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trophy } from "lucide-react";
import { toast } from "sonner";

export default function MatchesPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["matches"], queryFn: getMatches });
  const { data: teamsData } = useQuery({ queryKey: ["teams"], queryFn: getTeams });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ teamAId: "", teamBId: "", tournament: "", startTime: "" });

  const createMutation = useMutation({
    mutationFn: createMatch,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["matches"] }); toast.success("Match created"); setOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  const resultMutation = useMutation({
    mutationFn: setMatchResult,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["matches"] }); toast.success("Result set"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const teams = teamsData?.data ?? [];
  const matches: Match[] = data?.data ?? [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.teamAId || !form.teamBId || !form.tournament || !form.startTime) return toast.error("All fields required");
    createMutation.mutate({ ...form, startTime: new Date(form.startTime).toISOString() });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-display">Matches</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Create Match</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle className="font-display">Create Match</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <select value={form.teamAId} onChange={e => setForm(f => ({ ...f, teamAId: e.target.value }))}
                className="w-full h-10 px-3 rounded-md bg-secondary border border-border text-sm text-foreground">
                <option value="">Team A</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <select value={form.teamBId} onChange={e => setForm(f => ({ ...f, teamBId: e.target.value }))}
                className="w-full h-10 px-3 rounded-md bg-secondary border border-border text-sm text-foreground">
                <option value="">Team B</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <Input placeholder="Tournament" value={form.tournament} onChange={e => setForm(f => ({ ...f, tournament: e.target.value }))} className="bg-secondary border-border" />
              <Input type="datetime-local" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} className="bg-secondary border-border" />
              <Button type="submit" disabled={createMutation.isPending} className="w-full">
                {createMutation.isPending ? "Creating..." : "Create Match"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : matches.length === 0 ? (
        <p className="text-muted-foreground">No matches yet</p>
      ) : (
        <div className="space-y-3">
          {matches.map((m) => (
            <div key={m.id} className="glass-card p-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{m.teamA?.name ?? m.teamAId}</span>
                  <span className="text-muted-foreground text-xs">vs</span>
                  <span className="font-medium">{m.teamB?.name ?? m.teamBId}</span>
                </div>
                <p className="text-xs text-muted-foreground">{m.tournament} · {new Date(m.startTime).toLocaleString()}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                m.status === "SCHEDULED" ? "bg-neon-cyan/10 text-neon-cyan" :
                m.status === "FINISHED" ? "bg-neon-green/10 text-neon-green" : "bg-secondary text-muted-foreground"
              }`}>
                {m.status}{m.result ? ` — ${m.result}` : ""}
              </span>
              {m.status === "SCHEDULED" && (
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => resultMutation.mutate({ matchId: m.id, winner: "TEAM_A" })}
                    disabled={resultMutation.isPending}>
                    <Trophy className="h-3 w-3 mr-1" /> A Wins
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => resultMutation.mutate({ matchId: m.id, winner: "TEAM_B" })}
                    disabled={resultMutation.isPending}>
                    <Trophy className="h-3 w-3 mr-1" /> B Wins
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
