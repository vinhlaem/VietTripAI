import type { ActivityPlan, GeneratedItinerary } from "../types";
import { estimateTripCost } from "./estimateTripCost";

function toRadians(value: number) {
  return value * Math.PI / 180;
}

function enrichRoute(activities: ActivityPlan[]) {
  return activities.map((activity, index) => {
    if (!index) return { ...activity, travelFromPreviousKm: undefined, travelMinutes: undefined };
    const previous = activities[index - 1];
    if (previous.latitude == null || previous.longitude == null || activity.latitude == null || activity.longitude == null) {
      return { ...activity, travelFromPreviousKm: undefined, travelMinutes: undefined };
    }
    const latitudeDelta = toRadians(activity.latitude - previous.latitude);
    const longitudeDelta = toRadians(activity.longitude - previous.longitude);
    const value = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(toRadians(previous.latitude)) * Math.cos(toRadians(activity.latitude)) * Math.sin(longitudeDelta / 2) ** 2;
    const distance = 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
    return { ...activity, travelFromPreviousKm: Math.round(distance * 10) / 10, travelMinutes: Math.max(5, Math.round(distance / 25 * 60)) };
  });
}

export function recalculateItinerary(trip: GeneratedItinerary): GeneratedItinerary {
  const dailyPlans = trip.dailyPlans.map((plan) => ({ ...plan, activities: enrichRoute(plan.activities) }));
  const activities = dailyPlans.flatMap((plan) => plan.activities);
  return {
    ...trip,
    dailyPlans,
    estimatedCost: estimateTripCost(trip.budget, trip.days, activities, trip.preferences?.hotelBudgetPercent),
  };
}