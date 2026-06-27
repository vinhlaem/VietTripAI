import type { GeneratedItinerary, PlannerEngineInput } from "../types";

export function formatPlannerContext(
  input: PlannerEngineInput,
  itinerary: Omit<GeneratedItinerary, "plannerContext">,
) {
  const placeNames = input.places.map((place) => place.name).join(", ");
  const weatherConditions = input.weather?.forecast
    .map((day) => `${day.date}:${day.conditionKey}`)
    .join(", ");

  return [
    `Destination: ${input.destination}`,
    `Days: ${input.days}`,
    `Budget: ${input.budget}`,
    `Interests: ${input.interests.join(", ")}`,
    `Places: ${placeNames || "none"}`,
    `Weather: ${weatherConditions || "unavailable"}`,
    `Generated days: ${itinerary.dailyPlans.length}`,
    `Warnings: ${itinerary.warnings.join(", ") || "none"}`,
  ].join("\n");
}
