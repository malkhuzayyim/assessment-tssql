export const upgradePriceCalculation = ({
  currentPrice,
  newPrice,
  daysRemaining,
}: {
  currentPrice: number;
  newPrice: number;
  daysRemaining: number;
}) => {
  if (daysRemaining < 0) {
    throw new Error("Days remaining cannot be negative.");
  }

  if (newPrice <= currentPrice) {
    throw new Error(
      "New plan should be more expensive than current plan for upgrade"
    );
  }

  const dailyCostCurrentPlan = currentPrice / 30;

  const remainingCostCurrentCycle = dailyCostCurrentPlan * daysRemaining;

  const upgradeCost = newPrice - remainingCostCurrentCycle;

  return upgradeCost;
};
