import { trpcError } from "../../trpc/core";

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
    throw new trpcError({
      code: "BAD_REQUEST",
      message: "Days remaining cannot be negative.",
    });
  }

  if (newPrice <= currentPrice) {
    throw new trpcError({
      code: "BAD_REQUEST",
      message:
        "New plan should be more expensive than current plan for upgrade.",
    });
  }

  const dailyCostCurrentPlan = currentPrice / 30;

  const remainingCostCurrentCycle = dailyCostCurrentPlan * daysRemaining;

  const upgradeCost = newPrice - remainingCostCurrentCycle;

  return upgradeCost;
};
