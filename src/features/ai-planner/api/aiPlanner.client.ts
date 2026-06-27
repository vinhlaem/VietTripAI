import type { AiEnhancementRequest, AiEnhancementResponse } from "../types";

function isEnhancementResponse(value: unknown): value is AiEnhancementResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.source === "string" &&
    (candidate.source === "ai-enhanced" || candidate.source === "fallback") &&
    Boolean(candidate.itinerary)
  );
}

export async function enhanceItinerary(
  request: AiEnhancementRequest,
): Promise<AiEnhancementResponse> {
  const response = await fetch("/api/ai-planner/enhance", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Unable to enhance itinerary.");
  }

  const payload: unknown = await response.json();

  if (!isEnhancementResponse(payload)) {
    throw new Error("Invalid AI enhancement response.");
  }

  return payload;
}
