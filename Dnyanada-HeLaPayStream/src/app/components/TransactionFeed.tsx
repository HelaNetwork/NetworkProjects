// src/app/components/TransactionFeed.tsx
export const TransactionFeed = ({ txs, loading }: { txs: any[], loading?: boolean }) => {
  // 💡 Debugging: Confirms data arrival in console
  console.log("Ledger Data received:", txs);

  // 1. Loading State (The "Scanning" effect)
  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white/5 rounded-3xl border border-white/5">
        <div className="animate-pulse mb-2 italic font-medium">Syncing Protocol Ledger...</div>
        <p className="text-[10px] opacity-60">Connecting to Supabase Realtime Indexer</p>
      </div>
    );
  }

  // 2. Empty State (Actual zero results found)
  if (!txs || txs.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white/5 rounded-3xl border border-white/10">
        <div className="mb-2 font-medium">No Activity Found</div>
        <p className="text-[10px] opacity-60">Your protocol transactions will appear here live.</p>
      </div>
    );
  }

  // 3. Data List
  return (
    <div className="grid gap-3">
      {txs.map((tx, i) => (
        <div key={tx.hash || i} className="flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-2xl transition-all hover:bg-white/10">
          <div>
            <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest">
              {tx.type}
            </span>
            <p className="text-[10px] font-mono text-slate-500 mt-1">
              <a 
                href={`https://testnet.helascan.io/tx/${tx.hash}`} 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-teal-400 underline decoration-dotted"
              >
                {tx.hash?.slice(0, 16)}...
              </a>
            </p>
          </div>
          <div className="text-[10px] font-mono font-bold text-slate-400">
             Block {tx.block}
          </div>
        </div>
      ))}
    </div>
  );
};