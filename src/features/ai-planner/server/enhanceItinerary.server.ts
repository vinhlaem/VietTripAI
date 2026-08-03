import { GoogleGenAI } from "@google/genai";
import { buildItineraryEnhancementPrompt } from "../prompts/buildItineraryEnhancementPrompt";
import type { AiEnhancementRequest, AiEnhancementResponse } from "../types";
import { mergeAiEnhancement } from "../utils/mergeAiEnhancement";
import { parseAiEnhancement } from "../utils/parseAiEnhancement";

const GEMINI_MODELS = (process.env.GEMINI_PLANNER_MODELS ?? "gemini-3.5-flash-lite,gemini-2.5-flash").split(",").map((model) => model.trim()).filter(Boolean);
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 100;
const responseCache = new Map<string, { expiresAt: number; response: AiEnhancementResponse }>();
const inFlightRequests = new Map<string, Promise<AiEnhancementResponse>>();
const unavailableModels = new Set<string>();
const modelCooldowns = new Map<string, number>();

const AI_ENHANCEMENT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["tripSummary", "tripTips", "dayEnhancements"],
  properties: {
    tripSummary: { type: "string" },
    tripTips: { type: "array", items: { type: "string" } },
    dayEnhancements: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["day", "activityEnhancements"],
        properties: {
          day: { type: "number" },
          dayTitle: { type: "string" },
          daySummary: { type: "string" },
          weatherTip: { type: "string" },
          activityEnhancements: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["activityId"],
              properties: {
                activityId: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                localTip: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
} as const;
type GeminiErrorDetails = {
  message: string;
  status?: string | number;
};

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object");
}

function readErrorField(error: unknown, field: string) {
  if (!isRecord(error)) {
    return undefined;
  }

  const value = error[field];
  return typeof value === "string" || typeof value === "number" ? value : undefined;
}

function getGeminiErrorDetails(error: unknown): GeminiErrorDetails {
  const message = error instanceof Error ? error.message : "Unknown Gemini error.";
  const directStatus = readErrorField(error, "status") ?? readErrorField(error, "statusCode") ?? readErrorField(error, "code");
  const inferredStatus = /429|RESOURCE_EXHAUSTED/.test(message) ? "429" : /404|NOT_FOUND/.test(message) ? "404" : undefined;
  return { message, status: directStatus ?? inferredStatus };
}

function assertPrompt(prompt: string) {
  if (!prompt.trim()) {
    throw new Error("Gemini prompt is empty. Cannot enhance itinerary.");
  }
}

function extractGeminiText(responseText: string | undefined) {
  const text = responseText?.trim();

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return text;
}

async function callGeminiModel(ai: GoogleGenAI, model: string, prompt: string) {
  assertPrompt(prompt);

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: AI_ENHANCEMENT_SCHEMA,
      maxOutputTokens: 8192,
    },
  });

  return parseAiEnhancement(extractGeminiText(response.text));
}

async function callGemini(prompt: string, apiKey: string) {
  const ai = new GoogleGenAI({ apiKey });
  let lastError: Error | null = null;
  for (const model of GEMINI_MODELS) {
    if (unavailableModels.has(model) || (modelCooldowns.get(model) ?? 0) > Date.now()) continue;
    try {
      return await callGeminiModel(ai, model, prompt);
    } catch (error) {
      const details = getGeminiErrorDetails(error);
      const status = details.status ? String(details.status) : "error";
      if (status === "404") unavailableModels.add(model);
      if (status === "429") modelCooldowns.set(model, Date.now() + 60_000);
      console.warn(`AI planner skipped ${model} (${status}): ${details.message.slice(0, 240)}`);
      lastError = error instanceof Error ? error : new Error(details.message);
    }
  }
  throw lastError ?? new Error("No Gemini planner model is currently available.");
}

function requestCacheKey(request: AiEnhancementRequest) { return JSON.stringify(request); }
function saveToCache(key: string, response: AiEnhancementResponse) {
  if (responseCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = responseCache.keys().next().value;
    if (oldestKey) responseCache.delete(oldestKey);
  }
  responseCache.set(key, { response, expiresAt: Date.now() + CACHE_TTL_MS });
}
async function performEnhancement(request: AiEnhancementRequest, apiKey: string): Promise<AiEnhancementResponse> {
  try {
    const prompt = buildItineraryEnhancementPrompt(request);
    assertPrompt(prompt);
    const enhancement = await callGemini(prompt, apiKey);
    return { itinerary: mergeAiEnhancement(request.baseItinerary, enhancement), source: "ai-enhanced" };
  } catch {
    return { itinerary: request.baseItinerary, source: "fallback", warning: "aiUnavailable" };
  }
}

export async function enhanceItineraryOnServer(request: AiEnhancementRequest): Promise<AiEnhancementResponse> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return { itinerary: request.baseItinerary, source: "fallback", warning: "aiUnavailable" };
  const key = requestCacheKey(request);
  const cached = responseCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.response;
  const existing = inFlightRequests.get(key);
  if (existing) return existing;
  const pending = performEnhancement(request, apiKey).then((response) => {
    if (response.source === "ai-enhanced") saveToCache(key, response);
    return response;
  }).finally(() => inFlightRequests.delete(key));
  inFlightRequests.set(key, pending);
  return pending;
}