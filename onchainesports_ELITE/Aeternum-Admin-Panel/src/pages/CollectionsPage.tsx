import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCollection } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function CollectionsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", collectionMint: "", metadataUri: "" });

  const mutation = useMutation({
    mutationFn: createCollection,
    onSuccess: () => {
      toast.success("Collection created");
      setOpen(false);
      setForm({ name: "", description: "", collectionMint: "", metadataUri: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.collectionMint) return toast.error("Name and collection mint are required");
    mutation.mutate(form);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-display">Collections</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Create Collection</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle className="font-display">Create Collection</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input placeholder="Collection Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-secondary border-border" />
              <Textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="bg-secondary border-border" />
              <Input placeholder="Collection Mint Address" value={form.collectionMint} onChange={e => setForm(f => ({ ...f, collectionMint: e.target.value }))} className="bg-secondary border-border" />
              <Input placeholder="Metadata URI" value={form.metadataUri} onChange={e => setForm(f => ({ ...f, metadataUri: e.target.value }))} className="bg-secondary border-border" />
              <Button type="submit" disabled={mutation.isPending} className="w-full">
                {mutation.isPending ? "Creating..." : "Create Collection"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-muted-foreground text-sm">Collections are created via the form above. Asset listing will show linked collections.</p>
    </div>
  );
}
