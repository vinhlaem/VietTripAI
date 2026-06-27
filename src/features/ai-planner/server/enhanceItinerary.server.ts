import { GoogleGenAI } from "@google/genai";
import { buildItineraryEnhancementPrompt } from "../prompts/buildItineraryEnhancementPrompt";
import type { AiEnhancementRequest, AiEnhancementResponse } from "../types";
import { mergeAiEnhancement } from "../utils/mergeAiEnhancement";
import { parseAiEnhancement } from "../utils/parseAiEnhancement";

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-1.5-flash"];

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

  return {
    message,
    status:
      readErrorField(error, "status") ??
      readErrorField(error, "statusCode") ??
      readErrorField(error, "code"),
  };
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
  });

  return extractGeminiText(response.text);
}

async function callGemini(prompt: string, apiKey: string) {
  const ai = new GoogleGenAI({ apiKey });
  let lastError: Error | null = null;

  for (const model of GEMINI_MODELS) {
    try {
      return await callGeminiModel(ai, model, prompt);
    } catch (error) {
      const details = getGeminiErrorDetails(error);
      const status = details.status ? ` status=${details.status}` : "";

      console.warn(
        `AI planner Gemini request failed for ${model}:${status} ${details.message}`,
      );

      lastError = error instanceof Error ? error : new Error(details.message);
    }
  }

  throw lastError ?? new Error("Gemini request failed.");
}

export async function enhanceItineraryOnServer(
  request: AiEnhancementRequest,
): Promise<AiEnhancementResponse> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    console.warn("AI planner fallback: GEMINI_API_KEY is missing.");

    return {
      itinerary: request.baseItinerary,
      source: "fallback",
      warning: "aiUnavailable",
    };
  }

  try {
    const prompt = buildItineraryEnhancementPrompt(request);
    assertPrompt(prompt);

    const rawText = await callGemini(prompt, apiKey);
    const enhancement = parseAiEnhancement(rawText);
    const itinerary = mergeAiEnhancement(request.baseItinerary, enhancement);

    return {
      itinerary,
      source: "ai-enhanced",
    };
  } catch (error) {
    console.warn(
      "AI planner fallback:",
      error instanceof Error ? error.message : "unknown error",
    );

    return {
      itinerary: request.baseItinerary,
      source: "fallback",
      warning: "aiUnavailable",
    };
  }
}
