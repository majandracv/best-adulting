export type UserTier = "free" | "pro"

export interface TierLimits {
  maxAssets: number
  maxPriceComparisons: number
}

export const TIER_LIMITS: Record<UserTier, TierLimits> = {
  free: {
    maxAssets: 5,
    maxPriceComparisons: 2,
  },
  pro: {
    maxAssets: Number.POSITIVE_INFINITY,
    maxPriceComparisons: 6,
  },
}

export function checkAssetLimit(currentCount: number, tier: UserTier): boolean {
  return currentCount < TIER_LIMITS[tier].maxAssets
}

export function checkPriceComparisonLimit(currentCount: number, tier: UserTier): boolean {
  return currentCount < TIER_LIMITS[tier].maxPriceComparisons
}
