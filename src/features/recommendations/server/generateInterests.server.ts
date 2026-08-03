import { GoogleGenAI } from "@google/genai";
import type { AiInterestRequest, AiInterestResponse, DynamicInterest } from "../types";

const MODELS = (process.env.GEMINI_INTERESTS_MODELS ?? "gemini-3.5-flash-lite,gemini-2.5-flash").split(",").map((model) => model.trim()).filter(Boolean);
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const responseCache = new Map<string, { expiresAt: number; response: AiInterestResponse }>();
const inFlightRequests = new Map<string, Promise<AiInterestResponse>>();
const unavailableModels = new Set<string>();
const modelCooldowns = new Map<string, number>();
const SCHEMA = {
  type: "object", additionalProperties: false, required: ["interests"],
  properties: { interests: { type: "array", minItems: 6, maxItems: 10, items: {
    type: "object", additionalProperties: false, required: ["label"], properties: { label: { type: "string" } },
  } } },
} as const;

function parseInterestPayload(rawText: string): unknown {
  const fence = String.fromCharCode(96).repeat(3);
  let text = rawText.trim();
  if (text.startsWith(fence)) text = text.slice(fence.length).replace(/^json\s*/i, "");
  if (text.endsWith(fence)) text = text.slice(0, -fence.length);
  const start = text.indexOf("{");
  if (start >= 0) text = text.slice(start);
  text = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").replace(/,\s*([}\]])/g, "$1");
  try {
    return JSON.parse(text);
  } catch (parseError) {
    const labels: Array<{ label: string }> = [];
    const pattern = /"label"\s*:\s*("(?:\\.|[^"\\])*")/g;
    for (const match of text.matchAll(pattern)) {
      try {
        const label = JSON.parse(match[1]);
        if (typeof label === "string" && label.trim()) labels.push({ label });
      } catch {
        // Ignore only the malformed item and retain complete labels before it.
      }
    }
    if (labels.length >= 4) return { interests: labels };
    throw parseError;
  }
}
function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
}

function normalize(raw: unknown): DynamicInterest[] {
  if (!raw || typeof raw !== "object") return [];
  const items = (raw as { interests?: unknown }).interests;
  if (!Array.isArray(items)) return [];
  const seen = new Set<string>();
  return items.flatMap((item) => {
    const label = item && typeof item === "object" && typeof (item as { label?: unknown }).label === "string"
      ? (item as { label: string }).label.trim().replace(/\s+/g, " ").slice(0, 70) : "";
    const slug = slugify(label);
    if (!label || !slug || seen.has(slug)) return [];
    seen.add(slug);
    return [{ id: `ai:${slug}`, label, source: "ai" as const }];
  }).slice(0, 10);
}

function buildPrompt(input: AiInterestRequest) {
  return `You are a Vietnam travel expert. Generate 6-10 concise selectable travel interests in ${input.locale === "vi" ? "Vietnamese" : "English"} for this exact destination and traveler.
DESTINATION: province=${input.province}; area=${input.areaName}; search=${input.searchQuery ?? ""}
CURATED AREA TAGS: ${JSON.stringify(input.areaTags)}
NEARBY PLACE SIGNALS (incomplete free API data): ${JSON.stringify(input.placeSignals.slice(0, 35))}
CONTEXT: rainy=${Boolean(input.isRainy)}; party=${input.travelParty}; pace=${input.pace}; accessibility=${input.accessibility}; prefersIndoor=${input.indoorPreference}; previousLikes=${JSON.stringify(input.preferredTags)}
Use your destination knowledge as well as the supplied signals. The place API is incomplete: include defining experiences that truly belong to the destination even when absent from place signals (for example beach/sea experiences for coastal Da Nang). Never output the name of a specific attraction, temple, business, beach, or landmark. Interests are generic themes such as spiritual architecture or beach activities, not place names. Exclude accommodation/hotels. Adapt to the traveler and weather without removing signature destination experiences. Each label must be natural, distinct, specific, and at most 6 words. Never append the area name or counts to every label.`;
}

function cacheKey(input: AiInterestRequest) {
  const categorySignals = [...new Set(input.placeSignals.map((place) => `${place.group}:${place.category}`))].sort();
  return JSON.stringify({ locale: input.locale, province: input.province, areaName: input.areaName, areaTags: [...input.areaTags].sort(), categorySignals, isRainy: input.isRainy, travelParty: input.travelParty, pace: input.pace, accessibility: input.accessibility, indoorPreference: input.indoorPreference, preferredTags: [...input.preferredTags].sort() });
}
function errorStatus(error: unknown) {
  if (!error || typeof error !== "object") return undefined;
  const record = error as Record<string, unknown>;
  const direct = record.status ?? record.code;
  if (typeof direct === "number" || typeof direct === "string") return String(direct);
  const message = error instanceof Error ? error.message : JSON.stringify(error);
  if (/429|RESOURCE_EXHAUSTED/.test(message)) return "429";
  if (/404|NOT_FOUND/.test(message)) return "404";
  return undefined;
}
async function requestInterests(input: AiInterestRequest, apiKey: string): Promise<AiInterestResponse> {
  const ai = new GoogleGenAI({ apiKey });
  for (const model of MODELS) {
    if (unavailableModels.has(model) || (modelCooldowns.get(model) ?? 0) > Date.now()) continue;
    try {
      const response = await ai.models.generateContent({ model, contents: buildPrompt(input), config: {
        responseMimeType: "application/json", responseJsonSchema: SCHEMA, maxOutputTokens: 4096,
      } });
      const interests = normalize(parseInterestPayload(response.text ?? ""));
      if (interests.length >= 4) return { interests, source: "ai" };
      throw new Error("Gemini returned too few valid interests.");
    } catch (error) {
      const status = errorStatus(error);
      if (status === "404") unavailableModels.add(model);
      if (status === "429") modelCooldowns.set(model, Date.now() + 60_000);
      console.warn(`AI interests skipped ${model} (${status ?? "error"}):`, error instanceof Error ? error.message.slice(0, 240) : "request failed");
    }
  }
  return { interests: [], source: "fallback", warning: "aiUnavailable" };
}

export async function generateInterestsOnServer(input: AiInterestRequest): Promise<AiInterestResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { interests: [], source: "fallback", warning: "aiUnavailable" };
  const key = cacheKey(input);
  const cached = responseCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.response;
  const existing = inFlightRequests.get(key);
  if (existing) return existing;
  const request = requestInterests(input, apiKey).then((response) => {
    if (response.source === "ai") responseCache.set(key, { response, expiresAt: Date.now() + CACHE_TTL_MS });
    return response;
  }).finally(() => inFlightRequests.delete(key));
  inFlightRequests.set(key, request);
  return request;
}