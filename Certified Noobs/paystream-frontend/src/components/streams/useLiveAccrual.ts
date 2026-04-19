"use client";

import { useState, useEffect } from "react";
import { formatUnits } from "viem";

export type UseLiveAccrualParams = {
  startTime: number;
  ratePerSecondWei: bigint;
  withdrawnWei: bigint;
  totalDepositWei: bigint;
  active: boolean;
  pausedAt: number;
  /** One-time bonus total added; accrues only until this is reached. */
  totalBonusAddedWei?: bigint;
  /** How much of the bonus has been withdrawn. */
  bonusWithdrawnWei?: bigint;
};

/** Base: unbounded (elapsed * rate - withdrawn). Bonus: finite (totalBonusAdded - bonusWithdrawn). Total = base + bonus. */
export function useLiveAccrual(p: UseLiveAccrualParams): string {
  const [live, setLive] = useState("0");
  const totalBonus = p.totalBonusAddedWei ?? BigInt(0);
  const bonusWithdrawn = p.bonusWithdrawnWei ?? BigInt(0);

  useEffect(() => {
    if (!p.active && p.pausedAt === 0) {
      setLive("0");
      return;
    }
    const endTime = p.pausedAt > 0 ? p.pausedAt : Math.floor(Date.now() / 1000);
    if (endTime <= p.startTime) {
      setLive("0");
      return;
    }
    const update = () => {
      const now = Math.floor(Date.now() / 1000);
      const effectiveEnd = p.pausedAt > 0 ? p.pausedAt : now;
      const elapsed = effectiveEnd - p.startTime;
      if (elapsed <= 0) {
        setLive("0");
        return;
      }
      const elapsedBig = BigInt(elapsed);
      const baseGross = elapsedBig * p.ratePerSecondWei;
      const baseAccrued = baseGross > p.withdrawnWei ? baseGross - p.withdrawnWei : BigInt(0);
      const bonusAccrued = totalBonus > bonusWithdrawn ? totalBonus - bonusWithdrawn : BigInt(0);
      const amount = baseAccrued + bonusAccrued;
      setLive(formatUnits(amount, 18));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [p.active, p.pausedAt, p.startTime, p.ratePerSecondWei, p.withdrawnWei, totalBonus, bonusWithdrawn]);

  return live;
}
