import type {
  AiActivityEnhancement,
  AiDayEnhancement,
  AiItineraryEnhancement,
} from "../types";

function stripCodeFences(value: string) {
  return value
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function parseActivityEnhancement(value: unknown): AiActivityEnhancement | null {
  if (!isRecord(value) || typeof value.activityId !== "string") {
    return null;
  }

  return {
    activityId: value.activityId,
    title: optionalString(value.title),
    description: optionalString(value.description),
    localTip: optionalString(value.localTip),
  };
}

function parseDayEnhancement(value: unknown): AiDayEnhancement | null {
  if (!isRecord(value) || typeof value.day !== "number") {
    return null;
  }

  const rawActivities = Array.isArray(value.activityEnhancements)
    ? value.activityEnhancements
    : [];

  return {
    day: value.day,
    dayTitle: optionalString(value.dayTitle),
    daySummary: optionalString(value.daySummary),
    weatherTip: optionalString(value.weatherTip),
    activityEnhancements: rawActivities
      .map(parseActivityEnhancement)
      .filter((activity): activity is AiActivityEnhancement => activity !== null),
  };
}

export function parseAiEnhancement(rawText: string): AiItineraryEnhancement {
  const parsed: unknown = JSON.parse(stripCodeFences(rawText));

  if (!isRecord(parsed) || typeof parsed.tripSummary !== "string") {
    throw new Error("Invalid AI enhancement: missing trip summary.");
  }

  if (!isStringArray(parsed.tripTips)) {
    throw new Error("Invalid AI enhancement: missing trip tips.");
  }

  if (!Array.isArray(parsed.dayEnhancements)) {
    throw new Error("Invalid AI enhancement: missing day enhancements.");
  }

  return {
    tripSummary: parsed.tripSummary,
    tripTips: parsed.tripTips,
    dayEnhancements: parsed.dayEnhancements
      .map(parseDayEnhancement)
      .filter((day): day is AiDayEnhancement => day !== null),
  };
}
