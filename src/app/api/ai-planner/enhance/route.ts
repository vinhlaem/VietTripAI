import { NextRequest, NextResponse } from "next/server";
import { enhanceItineraryOnServer } from "@/features/ai-planner/server/enhanceItinerary.server";
import type { AiEnhancementRequest, AiPlannerLocale } from "@/features/ai-planner/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isLocale(value: unknown): value is AiPlannerLocale {
  return value === "vi" || value === "en";
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function parseRequestBody(value: unknown): AiEnhancementRequest | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    !isLocale(value.locale) ||
    typeof value.destination !== "string" ||
    typeof value.days !== "number" ||
    typeof value.budget !== "number" ||
    !isStringArray(value.interests) ||
    !isRecord(value.baseItinerary) ||
    !Array.isArray(value.places)
  ) {
    return null;
  }

  return {
    locale: value.locale,
    destination: value.destination,
    selectedProvince: typeof value.selectedProvince === "string" ? value.selectedProvince : undefined,
    selectedTouristArea: typeof value.selectedTouristArea === "string" ? value.selectedTouristArea : undefined,
    touristAreaSearchQuery: typeof value.touristAreaSearchQuery === "string" ? value.touristAreaSearchQuery : undefined,
    days: value.days,
    budget: value.budget,
    interests: value.interests,
    baseItinerary: value.baseItinerary as unknown as AiEnhancementRequest["baseItinerary"],
    places: value.places as AiEnhancementRequest["places"],
    weather: isRecord(value.weather) ? value.weather as unknown as AiEnhancementRequest["weather"] : null,
  };
}

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const enhancementRequest = parseRequestBody(payload);

  if (!enhancementRequest) {
    return NextResponse.json(
      { error: "Invalid AI planner request." },
      { status: 400 },
    );
  }

  const response = await enhanceItineraryOnServer(enhancementRequest);

  return NextResponse.json(response);
}


