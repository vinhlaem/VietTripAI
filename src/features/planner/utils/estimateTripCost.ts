import type { ActivityPlan, TripCostEstimate } from "../types";

function clampAmount(value: number, max: number) {
  return Math.max(0, Math.min(value, max));
}

export function estimateTripCost(
  budget: number,
  days: number,
  activities: ActivityPlan[],
): TripCostEstimate {
  const activityCount = activities.length;
  const baseline = Math.min(budget, days * 850000 + activityCount * 180000);
  const total = clampAmount(baseline, budget);

  const food = Math.round(total * 0.34);
  const transport = Math.round(total * 0.22);
  const tickets = Math.round(total * 0.28);
  const coffeeExtra = total - food - transport - tickets;

  return {
    items: [
      { label: "Food", amount: food },
      { label: "Transport", amount: transport },
      { label: "Tickets", amount: tickets },
      { label: "CoffeeExtra", amount: coffeeExtra },
    ],
    total,
  };
}
