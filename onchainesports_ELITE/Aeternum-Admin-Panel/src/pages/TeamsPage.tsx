import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTeams, createTeam, type Team } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function TeamsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["teams"], queryFn: getTeams });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", game: "", region: "", logoUrl: "" });

  const mutation = useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Team created");
      setOpen(false);
      setForm({ name: "", game: "", region: "", logoUrl: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.game || !form.region) return toast.error("Name, game, and region are required");
    mutation.mutate({ ...form, logoUrl: form.logoUrl || undefined });
  };

  const teams: Team[] = data?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-display">Teams</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Add Team</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle className="font-display">Create Team</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input placeholder="Team Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-secondary border-border" />
              <Input placeholder="Game (e.g. Dota 2)" value={form.game} onChange={e => setForm(f => ({ ...f, game: e.target.value }))} className="bg-secondary border-border" />
              <Input placeholder="Region (e.g. EU)" value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} className="bg-secondary border-border" />
              <Input placeholder="Logo URL (optional)" value={form.logoUrl} onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))} className="bg-secondary border-border" />
              <Button type="submit" disabled={mutation.isPending} className="w-full">
                {mutation.isPending ? "Creating..." : "Create Team"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : teams.length === 0 ? (
        <p className="text-muted-foreground">No teams found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((t) => (
            <div key={t.id} className="glass-card p-4 flex items-center gap-4">
              {t.logoUrl ? (
                <img src={t.logoUrl} alt={t.name} className="h-12 w-12 rounded-md object-cover bg-secondary" />
              ) : (
                <div className="h-12 w-12 rounded-md bg-secondary flex items-center justify-center text-muted-foreground font-display text-lg">
                  {t.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.game} · {t.region}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
