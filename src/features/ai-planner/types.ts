import type { Place } from "@/features/places/types";
import type { GeneratedItinerary } from "@/features/planner/types";
import type { NormalizedWeather } from "@/features/weather/types";

export type AiPlannerLocale = "vi" | "en";

export type AiPlannerSource = "ai-enhanced" | "fallback";

export interface AiEnhancementRequest {
  locale: AiPlannerLocale;
  destination: string;
  selectedProvince?: string;
  selectedTouristArea?: string;
  touristAreaSearchQuery?: string;
  days: number;
  budget: number;
  interests: string[];
  baseItinerary: GeneratedItinerary;
  places: Place[];
  weather: NormalizedWeather | null;
}

export interface AiEnhancementResponse {
  itinerary: GeneratedItinerary;
  source: AiPlannerSource;
  warning?: string;
}

export interface AiActivityEnhancement {
  activityId: string;
  title?: string;
  description?: string;
  localTip?: string;
}

export interface AiDayEnhancement {
  day: number;
  dayTitle?: string;
  daySummary?: string;
  weatherTip?: string;
  activityEnhancements: AiActivityEnhancement[];
}

export interface AiItineraryEnhancement {
  tripSummary: string;
  tripTips: string[];
  dayEnhancements: AiDayEnhancement[];
}

