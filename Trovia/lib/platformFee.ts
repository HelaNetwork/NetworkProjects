export const PLATFORM_FEE_BPS = Number(process.env.NEXT_PUBLIC_PLATFORM_FEE_BPS || "500");
export const PLATFORM_FEE_PERCENT = PLATFORM_FEE_BPS / 100;

export function calculatePlatformFee(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }
  return Number(((amount * PLATFORM_FEE_BPS) / 10_000).toFixed(6));
}

export function calculateDeveloperPayout(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }
  return Number((amount - calculatePlatformFee(amount)).toFixed(6));
}
