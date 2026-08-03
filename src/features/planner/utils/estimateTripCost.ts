import type { ActivityPlan, TripCostEstimate } from "../types";

function clampAmount(value: number, max: number) {
  return Math.max(0, Math.min(value, max));
}

export function estimateTripCost(budget: number, days: number, activities: ActivityPlan[], hotelBudgetPercent = 35): TripCostEstimate {
  const activityCount = activities.length;
  const baseline = Math.min(budget, days * 850000 + activityCount * 180000);
  const total = clampAmount(baseline, budget);
  const accommodation = Math.round(total * Math.max(0.1, Math.min(0.7, hotelBudgetPercent / 100)));
  const flexible = total - accommodation;
  const food = Math.round(flexible * 0.34);
  const transport = Math.round(flexible * 0.22);
  const tickets = Math.round(flexible * 0.28);
  const coffeeExtra = flexible - food - transport - tickets;
  return {
    items: [
      { label: "Accommodation", amount: accommodation },
      { label: "Food", amount: food },
      { label: "Transport", amount: transport },
      { label: "Tickets", amount: tickets },
      { label: "CoffeeExtra", amount: coffeeExtra },
    ],
    total,
  };
}