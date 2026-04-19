import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminTransactions,
  getAssetHolders,
  getAssetTransactions,
  getAssets,
  getTeams,
  mintAsset,
  type AdminTransactionType,
  type Asset,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const txTypeOptions: { label: string; value: "ALL" | AdminTransactionType }[] = [
  { label: "All", value: "ALL" },
  { label: "Buy Asset", value: "BUY_ASSET" },
  { label: "Sell Asset", value: "SELL_ASSET" },
  { label: "Buy Prediction", value: "BUY_PREDICTION" },
  { label: "Sell Prediction", value: "SELL_PREDICTION" },
  { label: "Claim Reward", value: "CLAIM_REWARD" },
];

const shortSig = (signature: string) => `${signature.slice(0, 8)}...${signature.slice(-8)}`;

const formatDateTime = (value: string) => new Date(value).toLocaleString();

export default function AssetsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["assets"], queryFn: getAssets });
  const { data: teamsData } = useQuery({ queryKey: ["teams"], queryFn: getTeams });
  const [open, setOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [transactionsOpen, setTransactionsOpen] = useState(false);
  const [holdersOpen, setHoldersOpen] = useState(false);
  const [txFilter, setTxFilter] = useState<"ALL" | AdminTransactionType>("ALL");
  const [form, setForm] = useState({ name: "", teamId: "", collectionId: "", totalSupply: "1000", basePrice: "5", kFactor: "0.1" });

  const selectedTxType = txFilter === "ALL" ? undefined : txFilter;
  const { data: globalTransactions, isLoading: globalTransactionsLoading } = useQuery({
    queryKey: ["admin-transactions", selectedTxType],
    queryFn: () => getAdminTransactions(selectedTxType),
  });

  const { data: assetTransactionsData, isLoading: assetTransactionsLoading } = useQuery({
    queryKey: ["asset-transactions", selectedAssetId],
    queryFn: () => getAssetTransactions(selectedAssetId as string),
    enabled: transactionsOpen && !!selectedAssetId,
  });

  const { data: assetHoldersData, isLoading: assetHoldersLoading } = useQuery({
    queryKey: ["asset-holders", selectedAssetId],
    queryFn: () => getAssetHolders(selectedAssetId as string),
    enabled: holdersOpen && !!selectedAssetId,
  });

  const mutation = useMutation({
    mutationFn: mintAsset,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assets"] });
      toast.success("Asset minted");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.teamId) return toast.error("Name and team are required");
    mutation.mutate({
      name: form.name, teamId: form.teamId, collectionId: form.collectionId,
      totalSupply: Number(form.totalSupply), basePrice: Number(form.basePrice), kFactor: Number(form.kFactor),
    });
  };

  const assets: Asset[] = data?.data ?? [];
  const teams = teamsData?.data ?? [];

  const openTransactions = (assetId: string) => {
    setSelectedAssetId(assetId);
    setTransactionsOpen(true);
  };

  const openHolders = (assetId: string) => {
    setSelectedAssetId(assetId);
    setHoldersOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-display">Assets</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Mint Asset</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle className="font-display">Mint Asset</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input placeholder="Asset Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-secondary border-border" />
              <select value={form.teamId} onChange={e => setForm(f => ({ ...f, teamId: e.target.value }))}
                className="w-full h-10 px-3 rounded-md bg-secondary border border-border text-sm text-foreground">
                <option value="">Select Team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <Input placeholder="Collection ID" value={form.collectionId} onChange={e => setForm(f => ({ ...f, collectionId: e.target.value }))} className="bg-secondary border-border" />
              <div className="grid grid-cols-3 gap-2">
                <Input placeholder="Supply" type="number" value={form.totalSupply} onChange={e => setForm(f => ({ ...f, totalSupply: e.target.value }))} className="bg-secondary border-border" />
                <Input placeholder="Base Price" type="number" value={form.basePrice} onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))} className="bg-secondary border-border" />
                <Input placeholder="K Factor" type="number" step="0.01" value={form.kFactor} onChange={e => setForm(f => ({ ...f, kFactor: e.target.value }))} className="bg-secondary border-border" />
              </div>
              <Button type="submit" disabled={mutation.isPending} className="w-full">
                {mutation.isPending ? "Minting..." : "Mint Asset"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass-card p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h2 className="text-xl font-display">Global Transactions</h2>
          <select
            value={txFilter}
            onChange={(e) => setTxFilter(e.target.value as "ALL" | AdminTransactionType)}
            className="h-10 px-3 rounded-md bg-secondary border border-border text-sm text-foreground"
          >
            {txTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {globalTransactionsLoading ? (
          <p className="text-muted-foreground text-sm">Loading transactions...</p>
        ) : !globalTransactions?.data?.length ? (
          <p className="text-muted-foreground text-sm">No transactions found</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>USDC</TableHead>
                <TableHead>Signature</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {globalTransactions.data.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.txType}</TableCell>
                  <TableCell>{tx.user.username || tx.user.walletAddress}</TableCell>
                  <TableCell>{tx.quantity}</TableCell>
                  <TableCell>{tx.amountUsdc.toFixed(2)}</TableCell>
                  <TableCell className="font-mono text-xs">{shortSig(tx.txSignature)}</TableCell>
                  <TableCell>{formatDateTime(tx.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : assets.length === 0 ? (
        <p className="text-muted-foreground">No assets minted yet</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((a) => {
            const priceChange = a.currentPrice - a.basePrice;
            const isUp = priceChange >= 0;
            return (
              <div key={a.id} className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium truncate">{a.name}</span>
                  <span className="text-xs bg-secondary px-2 py-0.5 rounded">{a.assetType}</span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-display font-bold text-primary">{a.currentPrice.toFixed(2)}</p>
                    <div className={`flex items-center gap-1 text-xs ${isUp ? "text-neon-green" : "text-destructive"}`}>
                      {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{a.circulating}/{a.totalSupply} circ.</p>
                    <p>K: {a.bondingCurveK}</p>
                  </div>
                </div>
                {a.team && <p className="text-xs text-muted-foreground mt-2">{a.team.name} · {a.team.game}</p>}
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openTransactions(a.id)}>Transactions</Button>
                  <Button size="sm" variant="outline" onClick={() => openHolders(a.id)}>Holders</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={transactionsOpen} onOpenChange={setTransactionsOpen}>
        <DialogContent className="bg-card border-border max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-display">Asset Transactions</DialogTitle>
          </DialogHeader>

          {!selectedAssetId || assetTransactionsLoading ? (
            <p className="text-muted-foreground text-sm">Loading transactions...</p>
          ) : !assetTransactionsData?.data?.length ? (
            <p className="text-muted-foreground text-sm">No transactions for this asset</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-3">
                {assetTransactionsData.asset.name} · {assetTransactionsData.asset.circulating}/{assetTransactionsData.asset.totalSupply} circulating
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>USDC</TableHead>
                    <TableHead>Signature</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assetTransactionsData.data.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{tx.txType}</TableCell>
                      <TableCell>{tx.user.username || tx.user.walletAddress}</TableCell>
                      <TableCell>{tx.quantity}</TableCell>
                      <TableCell>{tx.amountUsdc.toFixed(2)}</TableCell>
                      <TableCell className="font-mono text-xs">{shortSig(tx.txSignature)}</TableCell>
                      <TableCell>{formatDateTime(tx.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={holdersOpen} onOpenChange={setHoldersOpen}>
        <DialogContent className="bg-card border-border max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-display">Asset Holders</DialogTitle>
          </DialogHeader>

          {!selectedAssetId || assetHoldersLoading ? (
            <p className="text-muted-foreground text-sm">Loading holders...</p>
          ) : !assetHoldersData?.data?.length ? (
            <p className="text-muted-foreground text-sm">No holders for this asset</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-3">
                {assetHoldersData.asset.name} · Holders: {assetHoldersData.holdersCount} · Total held: {assetHoldersData.totalHeld}
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Wallet</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Avg Price</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assetHoldersData.data.map((holder) => (
                    <TableRow key={holder.id}>
                      <TableCell>{holder.user.username || "-"}</TableCell>
                      <TableCell className="font-mono text-xs">{holder.user.walletAddress}</TableCell>
                      <TableCell>{holder.quantity}</TableCell>
                      <TableCell>{holder.avgPrice.toFixed(2)}</TableCell>
                      <TableCell>{formatDateTime(holder.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
