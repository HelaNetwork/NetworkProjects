import { useId } from 'react';
import type { LessonDiagramKind } from '@/src/utils/lessons';

export function LessonDiagram({ kind }: { kind: LessonDiagramKind }) {
  const uid = useId().replace(/:/g, '');
  const mid = `arr-${uid}`;
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6">
      <svg viewBox="0 0 400 200" className="mx-auto h-auto w-full max-w-md text-slate-600" role="img" aria-hidden>
        {kind === 'web2-vs-web3' && (
          <>
            <text x="90" y="24" className="fill-slate-500 text-[11px] font-semibold">
              Web2
            </text>
            <rect x="24" y="36" width="132" height="140" rx="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
            <text x="48" y="64" className="fill-slate-600 text-[10px]">
              App server
            </text>
            <rect x="44" y="72" width="92" height="28" rx="4" fill="#e2e8f0" />
            <text x="52" y="118" className="fill-slate-600 text-[10px]">
              Your data
            </text>
            <rect x="44" y="126" width="92" height="36" rx="4" fill="#e2e8f0" />
            <text x="290" y="24" className="fill-slate-500 text-[11px] font-semibold">
              Web3
            </text>
            <rect x="244" y="36" width="132" height="140" rx="10" fill="#f8fafc" stroke="#6366f1" strokeWidth="1.5" />
            <text x="268" y="64" className="fill-slate-600 text-[10px]">
              Wallet (you)
            </text>
            <rect x="264" y="72" width="92" height="28" rx="4" fill="#e0e7ff" />
            <text x="260" y="118" className="fill-slate-600 text-[10px]">
              Shared ledger
            </text>
            <rect x="264" y="126" width="92" height="36" rx="4" fill="#e0e7ff" />
            <path d="M168 100 L232 100" stroke="#94a3b8" strokeWidth="2" markerEnd={`url(#${mid})`} />
            <defs>
              <marker id={mid} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <polygon points="0 0, 8 4, 0 8" fill="#94a3b8" />
              </marker>
            </defs>
          </>
        )}
        {kind === 'install-safety' && (
          <>
            <text x="120" y="28" className="fill-slate-600 text-[12px] font-semibold">
              Trusted install path
            </text>
            <rect x="40" y="48" width="100" height="56" rx="8" fill="#ecfdf5" stroke="#10b981" strokeWidth="1.5" />
            <text x="52" y="78" className="fill-emerald-800 text-[10px]">
              Official store
            </text>
            <rect x="160" y="48" width="100" height="56" rx="8" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" />
            <text x="178" y="78" className="fill-indigo-900 text-[10px]">
              MetaMask
            </text>
            <rect x="280" y="48" width="80" height="56" rx="8" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
            <text x="288" y="78" className="fill-slate-500 text-[9px]">
              Unknown
            </text>
            <text x="48" y="140" className="fill-rose-600 text-[10px] font-medium">
              Avoid random links & fake “updates”
            </text>
          </>
        )}
        {kind === 'connect-flow' && (
          <>
            <text x="130" y="28" className="fill-slate-600 text-[12px] font-semibold">
              Connect wallet
            </text>
            <rect x="32" y="52" width="88" height="44" rx="8" fill="#f1f5f9" stroke="#64748b" />
            <text x="48" y="78" className="fill-slate-700 text-[10px]">
              dApp
            </text>
            <path d="M128 74 H168" stroke="#6366f1" strokeWidth="2" />
            <text x="172" y="78" className="fill-indigo-600 text-[9px]">
              request
            </text>
            <rect x="220" y="52" width="100" height="44" rx="8" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" />
            <text x="236" y="78" className="fill-indigo-900 text-[10px]">
              MetaMask
            </text>
            <text x="32" y="130" className="fill-slate-500 text-[10px]">
              Site sees public address — never your seed phrase
            </text>
          </>
        )}
        {kind === 'network-stack' && (
          <>
            <text x="110" y="26" className="fill-slate-600 text-[12px] font-semibold">
              Same address, different chains
            </text>
            <rect x="48" y="44" width="304" height="36" rx="6" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
            <text x="120" y="66" className="fill-amber-900 text-[10px]">
              Always check active network
            </text>
            <rect x="48" y="96" width="92" height="72" rx="8" fill="#f8fafc" stroke="#94a3b8" />
            <text x="64" y="124" className="fill-slate-600 text-[9px]">
              Chain A
            </text>
            <rect x="154" y="96" width="92" height="72" rx="8" fill="#e0e7ff" stroke="#6366f1" />
            <text x="175" y="124" className="fill-indigo-900 text-[9px]">
              Hela
            </text>
            <rect x="260" y="96" width="92" height="72" rx="8" fill="#f8fafc" stroke="#94a3b8" />
            <text x="280" y="124" className="fill-slate-600 text-[9px]">
              Chain B
            </text>
            <text x="48" y="188" className="fill-slate-500 text-[9px]">
              Chain ID + RPC define which state you read
            </text>
          </>
        )}
        {kind === 'faucet-flow' && (
          <>
            <text x="130" y="26" className="fill-slate-600 text-[12px] font-semibold">
              Faucet flow
            </text>
            <rect x="40" y="50" width="72" height="40" rx="8" fill="#f1f5f9" stroke="#64748b" />
            <text x="52" y="74" className="fill-slate-700 text-[9px]">
              You
            </text>
            <path d="M118 70 H168" stroke="#6366f1" strokeWidth="2" />
            <rect x="172" y="46" width="96" height="48" rx="8" fill="#e0e7ff" stroke="#6366f1" />
            <text x="182" y="74" className="fill-indigo-900 text-[9px]">
              Faucet
            </text>
            <path d="M274 70 H318" stroke="#6366f1" strokeWidth="2" />
            <rect x="322" y="50" width="48" height="40" rx="8" fill="#ecfdf5" stroke="#10b981" />
            <text x="332" y="74" className="fill-emerald-800 text-[9px]">
              +τ
            </text>
            <text x="40" y="130" className="fill-slate-500 text-[10px]">
              Test tokens only — confirm balance before / after
            </text>
          </>
        )}
        {kind === 'balance-rpc' && (
          <>
            <text x="100" y="28" className="fill-slate-600 text-[12px] font-semibold">
              Wallet ↔ RPC ↔ Chain state
            </text>
            <rect x="40" y="52" width="88" height="40" rx="8" fill="#e0e7ff" stroke="#6366f1" />
            <text x="58" y="76" className="fill-indigo-900 text-[10px]">
              Wallet UI
            </text>
            <path d="M132 72 H188" stroke="#94a3b8" strokeWidth="2" />
            <rect x="192" y="52" width="88" height="40" rx="8" fill="#f1f5f9" stroke="#64748b" />
            <text x="210" y="76" className="fill-slate-700 text-[10px]">
              RPC node
            </text>
            <path d="M284 72 H340" stroke="#94a3b8" strokeWidth="2" />
            <rect x="344" y="52" width="48" height="40" rx="8" fill="#ecfdf5" stroke="#10b981" />
            <text x="352" y="76" className="fill-emerald-800 text-[9px]">
              Ledger
            </text>
            <text x="40" y="130" className="fill-slate-500 text-[10px]">
              Balances live on-chain; the wallet displays a read-only view
            </text>
          </>
        )}
        {kind === 'address-format' && (
          <>
            <text x="80" y="28" className="fill-slate-600 text-[12px] font-semibold">
              Public address (safe to share)
            </text>
            <rect x="32" y="48" width="336" height="44" rx="8" fill="#f8fafc" stroke="#cbd5e1" />
            <text x="44" y="74" className="fill-slate-700 font-mono text-[11px]">
              0x71C…9A3F
            </text>
            <rect x="32" y="108" width="336" height="52" rx="8" fill="#fff1f2" stroke="#fda4af" strokeDasharray="4 2" />
            <text x="44" y="132" className="fill-rose-800 text-[10px]">
              Seed phrase / private key — never paste or share
            </text>
            <text x="44" y="150" className="fill-rose-700 text-[9px]">
              Clipboard malware can swap addresses — verify prefix & suffix
            </text>
          </>
        )}
        {kind === 'transfer-receipt' && (
          <>
            <text x="100" y="26" className="fill-slate-600 text-[12px] font-semibold">
              One transaction, one receipt
            </text>
            <rect x="40" y="44" width="80" height="36" rx="6" fill="#e0e7ff" stroke="#6366f1" />
            <text x="58" y="66" className="fill-indigo-900 text-[9px]">
              From
            </text>
            <path d="M128 62 H168" stroke="#94a3b8" strokeWidth="2" />
            <rect x="172" y="44" width="80" height="36" rx="6" fill="#ecfdf5" stroke="#10b981" />
            <text x="198" y="66" className="fill-emerald-900 text-[9px]">
              To
            </text>
            <rect x="40" y="96" width="320" height="56" rx="8" fill="#f8fafc" stroke="#cbd5e1" />
            <text x="52" y="120" className="fill-slate-600 text-[10px]">
              Tx hash
            </text>
            <text x="52" y="138" className="fill-slate-500 font-mono text-[9px]">
              0xabc…def — explorer shows from / to / value
            </text>
          </>
        )}
        {kind === 'self-transfer' && (
          <>
            <text x="110" y="28" className="fill-slate-600 text-[12px] font-semibold">
              Self-transfer
            </text>
            <rect x="140" y="56" width="120" height="80" rx="12" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" />
            <text x="168" y="88" className="fill-indigo-900 text-[10px]">
              Your address
            </text>
            <text x="158" y="108" className="fill-indigo-800 text-[9px]">
              from = to
            </text>
            <path d="M80 96 H130" stroke="#6366f1" strokeWidth="2" />
            <path d="M270 96 H320" stroke="#6366f1" strokeWidth="2" />
            <text x="48" y="160" className="fill-slate-500 text-[10px]">
              Still pays gas; useful for practice & verification
            </text>
          </>
        )}
        {kind === 'hash-chain-integrity' && (
          <>
            <text x="90" y="26" className="fill-slate-600 text-[12px] font-semibold">
              Each block remembers the previous hash
            </text>
            <rect x="32" y="44" width="100" height="52" rx="8" fill="#e0e7ff" stroke="#6366f1" />
            <text x="52" y="68" className="fill-indigo-900 text-[10px]">
              Block n-1
            </text>
            <text x="40" y="88" className="fill-slate-500 font-mono text-[8px]">
              hash H1
            </text>
            <path d="M138 70 H168" stroke="#64748b" strokeWidth="2" />
            <rect x="172" y="44" width="100" height="52" rx="8" fill="#e0e7ff" stroke="#6366f1" />
            <text x="198" y="68" className="fill-indigo-900 text-[10px]">
              Block n
            </text>
            <text x="180" y="88" className="fill-slate-500 font-mono text-[8px]">
              prev = H1
            </text>
            <path d="M278 70 H308" stroke="#64748b" strokeWidth="2" />
            <rect x="312" y="44" width="56" height="52" rx="8" fill="#fef2f2" stroke="#f87171" strokeDasharray="3 2" />
            <text x="320" y="76" className="fill-rose-700 text-[9px]">
              Breaks if data changes
            </text>
            <text x="32" y="140" className="fill-slate-500 text-[10px]">
              Tampering breaks the link — that is the integrity idea you will explore in the task
            </text>
          </>
        )}
      </svg>
    </div>
  );
}

