import type { Place } from "@/features/places/types";
import type { DailyForecast } from "@/features/weather/types";
import {
  prefersCoffee,
  prefersLocalFood,
  prefersNightMarket,
} from "./planner.rules";
import { estimateTripCost } from "../utils/estimateTripCost";
import { formatPlannerContext } from "../utils/formatPlannerContext";
import { groupPlacesByDay } from "../utils/groupPlacesByDay";
import type {
  ActivityPlan,
  DayPlan,
  GeneratedItinerary,
  PlannerEngineInput,
  PlannerTimeOfDay,
} from "../types";

const timeSlots: PlannerTimeOfDay[] = ["morning", "lunch", "afternoon", "evening"];

function createPlaceActivity(
  place: Place,
  day: number,
  timeOfDay: PlannerTimeOfDay,
): ActivityPlan {
  return {
    id: `${day}-${timeOfDay}-${place.id}`,
    timeOfDay,
    title: place.name,
    placeName: place.name,
    category: place.category,
    description: place.address ?? "activityDescriptions.explorePlace",
    descriptionKey: place.address ? undefined : "activityDescriptions.explorePlace",
    estimatedCost: place.category === "museum" || place.category === "touristAttraction" ? 180000 : 80000,
    latitude: place.latitude,
    longitude: place.longitude,
    startTime: ({ morning: "08:00", lunch: "12:00", afternoon: "14:30", evening: "18:30" } as const)[timeOfDay],
    durationMinutes: timeOfDay === "evening" ? 120 : 150,
    environment: place.category === "museum" || place.category === "historicSite" ? "indoor" : place.category === "touristAttraction" ? "mixed" : "outdoor",
    accessibility: place.category === "nature" || place.category === "viewpoint" ? "moderate" : "easy",
  };
}

function createGenericActivity(
  day: number,
  timeOfDay: PlannerTimeOfDay,
  interests: string[],
): ActivityPlan {
  if (timeOfDay === "lunch") {
    const foodKey = prefersLocalFood(interests) ? "localFood" : "lunchBreak";

    return {
      id: `${day}-${timeOfDay}-${foodKey}`,
      timeOfDay,
      title: `activityTitles.${foodKey}`,
      titleKey: `activityTitles.${foodKey}`,
      description: `activityDescriptions.${foodKey}`,
      descriptionKey: `activityDescriptions.${foodKey}`,
      estimatedCost: 220000,
    };
  }

  if (timeOfDay === "evening" && prefersNightMarket(interests)) {
    return {
      id: `${day}-${timeOfDay}-nightMarket`,
      timeOfDay,
      title: "activityTitles.nightMarket",
      titleKey: "activityTitles.nightMarket",
      description: "activityDescriptions.nightMarket",
      descriptionKey: "activityDescriptions.nightMarket",
      estimatedCost: 180000,
    };
  }

  if (timeOfDay === "afternoon" && prefersCoffee(interests)) {
    return {
      id: `${day}-${timeOfDay}-coffeeBreak`,
      timeOfDay,
      title: "activityTitles.coffeeBreak",
      titleKey: "activityTitles.coffeeBreak",
      description: "activityDescriptions.coffeeBreak",
      descriptionKey: "activityDescriptions.coffeeBreak",
      estimatedCost: 120000,
    };
  }

  const fallbackKey = timeOfDay === "morning" ? "slowStart" : "riversideWalk";

  return {
    id: `${day}-${timeOfDay}-${fallbackKey}`,
    timeOfDay,
    title: `activityTitles.${fallbackKey}`,
    titleKey: `activityTitles.${fallbackKey}`,
    description: `activityDescriptions.${fallbackKey}`,
    descriptionKey: `activityDescriptions.${fallbackKey}`,
    estimatedCost: 90000,
  };
}

function createDayPlan(
  day: number,
  places: Place[],
  forecast: DailyForecast | undefined,
  interests: string[],
): DayPlan {
  const placeQueue = [...places];
  const activities = timeSlots.map((timeOfDay) => {
    if (timeOfDay !== "lunch") {
      const nextPlace = placeQueue.shift();

      if (nextPlace) {
        return createPlaceActivity(nextPlace, day, timeOfDay);
      }
    }

    return createGenericActivity(day, timeOfDay, interests);
  });

  return {
    day,
    title: `dayTitles.${Math.min(day, 5)}`,
    titleKey: `dayTitles.${Math.min(day, 5)}`,
    weatherSummary: forecast?.conditionKey,
    rainPlan: forecast && forecast.rainProbability >= 55 ? "rainPlan" : undefined,
    activities,
  };
}

function buildWarnings(input: PlannerEngineInput) {
  const warnings: string[] = [];

  if (!input.places.length) {
    warnings.push("warnings.placesFallback");
  }

  if (!input.weather) {
    warnings.push("warnings.weatherFallback");
    return warnings;
  }

  const hasRain = input.weather.forecast.some((day) => day.rainProbability >= 55);
  const hasHotDay = input.weather.forecast.some((day) => day.maxTemperature >= 32);
  const hasGoodWeather = input.weather.forecast.some(
    (day) => day.rainProbability <= 25 && day.maxTemperature < 32,
  );

  if (hasRain) {
    warnings.push("warnings.rain");
  }

  if (hasHotDay) {
    warnings.push("warnings.hot");
  }

  if (hasGoodWeather) {
    warnings.push("warnings.goodWeather");
  }

  return warnings;
}

export function generateItinerary(input: PlannerEngineInput): GeneratedItinerary {
  const preferenceFilteredPlaces = input.preferences?.accessibility === "limitedMobility"
    ? input.places.filter((place) => !["nature", "viewpoint"].includes(place.category))
    : input.places;
  const preferenceSortedPlaces = input.preferences?.indoorPreference
    ? [...preferenceFilteredPlaces].sort((a, b) => Number(["museum", "historicSite"].includes(b.category)) - Number(["museum", "historicSite"].includes(a.category)))
    : preferenceFilteredPlaces;
  const effectiveInterests = input.preferences?.travelParty === "family" ? [...input.interests, "Family friendly"] : input.interests;
  const weatherAwarePlaces = input.weather?.forecast.some((day) => day.rainProbability >= 55)
    ? [...preferenceSortedPlaces].sort((a, b) => Number(["museum", "historicSite"].includes(b.category)) - Number(["museum", "historicSite"].includes(a.category)))
    : preferenceSortedPlaces;
  const groupedPlaces = groupPlacesByDay(weatherAwarePlaces, input.days, effectiveInterests, input.preferences?.pace);
  const dailyPlans = groupedPlaces.map((places, index) =>
    createDayPlan(index + 1, places, input.weather?.forecast[index], input.interests),
  );
  const activities = dailyPlans.flatMap((day) => day.activities);
  const estimatedCost = estimateTripCost(input.budget, input.days, activities, input.preferences?.hotelBudgetPercent);
  const warnings = buildWarnings(input);
  const baseItinerary = {
    destination: input.destination,
    days: input.days,
    budget: input.budget,
    interests: input.interests,
    dailyPlans,
    estimatedCost,
    summary: input.places.length ? "summary.realData" : "summary.basicData",
    summaryKey: input.places.length ? "summary.realData" : "summary.basicData",
    warnings,
  };

  return {
    ...baseItinerary,
    plannerContext: formatPlannerContext(input, baseItinerary),
  };
}

