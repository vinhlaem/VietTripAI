import type { AiPlannerSource } from "@/features/ai-planner/types";
import type { Place } from "@/features/places/types";
import type { GeneratedItinerary } from "@/features/planner/types";
import type { NormalizedWeather } from "@/features/weather/types";
import type { UserTripDocumentPath } from "./utils/tripPaths";

export interface TripShareInfo {
  enabled: boolean;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShareTripMapping {
  userId: string;
  tripId: string;
  createdAt: string;
}

export interface ShareLinkResult {
  slug: string;
  url: string;
}

export interface SavedTrip {
  id: string;
  userId: string;
  destination: string;
  province?: string;
  touristArea?: string;
  days: number;
  budget: number;
  interests: string[];
  itinerary: GeneratedItinerary;
  places: Place[];
  weather: NormalizedWeather | null;
  aiSource?: AiPlannerSource;
  share?: TripShareInfo;
  createdAt: string;
  updatedAt: string;
}

export type SaveTripInput = Omit<SavedTrip, "id" | "userId" | "createdAt" | "updatedAt" | "share"> &
  Partial<Pick<SavedTrip, "id" | "createdAt">>;

export type TripDocumentPath = UserTripDocumentPath;
