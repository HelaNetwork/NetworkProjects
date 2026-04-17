"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatEther, parseEther, zeroAddress } from "viem";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { abis, addresses } from "@/lib/contracts";

export default function LiquidityPage() {
  const { address, isConnected } = useAccount();
  const [addEth, setAddEth] = useState("0.02");
  const [shares, setShares] = useState("10000000000000000");

  const pool = addresses.lpPool;
  const enabled = Boolean(address && pool);

  const { data: userShares, refetch } = useReadContract({
    address: pool,
    abi: abis.mockLPPool,
    functionName: "lpShares",
    args: [address ?? zeroAddress],
    query: { enabled },
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) void refetch();
  }, [isSuccess, refetch]);

  const busy = isPending || confirming;
  const sh =
    userShares !== undefined ? parseFloat(formatEther(userShares as bigint)).toFixed(6) : "0";

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">LP positions</h1>
        <p className="text-slate-600 dark:text-slate-400">
          FindHunt mock pool — native add/remove liquidity on Hela Testnet.
        </p>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Mock LP pool</CardTitle>
          <CardDescription>Add liquidity with one native transfer; remove by share amount</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">Your LP shares (wei-scale)</p>
            <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">{sh}</p>
            <div className="space-y-2">
              <Label>Add liquidity (HLUSD)</Label>
              <Input value={addEth} onChange={(e) => setAddEth(e.target.value)} />
              <Button
                disabled={!pool || !isConnected || busy}
                onClick={() =>
                  pool &&
                  writeContract({
                    address: pool,
                    abi: abis.mockLPPool,
                    functionName: "addLiquidity",
                    value: parseEther(addEth || "0"),
                  })
                }
              >
                {busy ? "Confirming…" : "Add liquidity"}
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Remove shares (wei, e.g. 1e16)</Label>
              <Input value={shares} onChange={(e) => setShares(e.target.value)} />
              <Button
                variant="secondary"
                disabled={!pool || !isConnected || busy}
                onClick={() =>
                  pool &&
                  writeContract({
                    address: pool,
                    abi: abis.mockLPPool,
                    functionName: "removeLiquidity",
                    args: [BigInt(shares || "0")],
                  })
                }
              >
                Remove liquidity
              </Button>
            </div>
            {hash && <p className="break-all text-xs text-slate-500">Tx: {hash}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
