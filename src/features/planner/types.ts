import type { Place, PlaceCategory } from "@/features/places/types";
import type { NormalizedWeather } from "@/features/weather/types";

export type PlannerTimeOfDay = "morning" | "lunch" | "afternoon" | "evening";

export type TripCostCategory = "Accommodation" | "Food" | "Transport" | "Tickets" | "CoffeeExtra";

export interface TripPreferences {
  travelParty: "solo" | "couple" | "family" | "friends";
  pace: "relaxed" | "balanced" | "active";
  accessibility: "standard" | "limitedMobility";
  indoorPreference: boolean;
  hotelBudgetPercent: number;
}

export interface PlannerEngineInput {
  destination: string;
  days: number;
  budget: number;
  interests: string[];
  places: Place[];
  weather: NormalizedWeather | null;
  preferences?: TripPreferences;
}

export interface ActivityPlan {
  id: string;
  timeOfDay: PlannerTimeOfDay;
  title: string;
  titleKey?: string;
  placeName?: string;
  category?: PlaceCategory;
  description: string;
  descriptionKey?: string;
  estimatedCost?: number;
  localTip?: string;
  latitude?: number;
  longitude?: number;
  startTime?: string;
  durationMinutes?: number;
  travelFromPreviousKm?: number;
  travelMinutes?: number;
  environment?: "indoor" | "outdoor" | "mixed";
  accessibility?: "easy" | "moderate";
}

export interface DayPlan {
  day: number;
  title: string;
  titleKey?: string;
  daySummary?: string;
  weatherSummary?: string;
  weatherTip?: string;
  rainPlan?: string;
  activities: ActivityPlan[];
}

export interface TripCostItem {
  label: TripCostCategory;
  amount: number;
}

export interface TripCostEstimate {
  items: TripCostItem[];
  total: number;
}

export interface GeneratedItinerary {
  destination: string;
  days: number;
  budget: number;
  interests: string[];
  dailyPlans: DayPlan[];
  estimatedCost: TripCostEstimate;
  summary: string;
  summaryKey?: string;
  warnings: string[];
  tips?: string[];
  plannerContext: string;
  preferences?: TripPreferences;
}
