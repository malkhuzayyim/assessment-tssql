// Example function within model.ts
export function calculateProratedUpgradePrice(currentPrice: number, newPrice: number, daysRemaining: number): number {
    const priceDifference = newPrice - currentPrice;
    return (priceDifference / 30) * daysRemaining;
}