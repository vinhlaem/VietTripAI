import type { NormalizedPlace } from "@/features/places/types";
export type TripRecommendations = { hotels: NormalizedPlace[]; food: NormalizedPlace[]; entertainment: NormalizedPlace[]; };
export type DynamicInterest = { id: string; label: string; availableCount?: number; source: "ai" | "area" | "places" | "fallback"; };

export type HotelSearchContext = {
  checkIn: string;
  checkOut: string;
  guests: number;
  destination?: string;
};

export type AiInterestRequest = {
  locale: "vi" | "en";
  province: string;
  areaName: string;
  searchQuery?: string;
  areaTags: string[];
  placeSignals: Array<{ name: string; category: string; group: string }>;
  isRainy?: boolean;
  travelParty: "solo" | "couple" | "family" | "friends";
  pace: "relaxed" | "balanced" | "active";
  accessibility: "standard" | "limitedMobility";
  indoorPreference: boolean;
  preferredTags: string[];
};

export type AiInterestResponse = {
  interests: DynamicInterest[];
  source: "ai" | "fallback";
  warning?: "aiUnavailable";
};