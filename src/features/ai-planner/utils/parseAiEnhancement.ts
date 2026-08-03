import type { AiActivityEnhancement, AiDayEnhancement, AiItineraryEnhancement } from "../types";

function stripCodeFences(value: string) {
  const fence = String.fromCharCode(96).repeat(3);
  let text = value.trim();
  if (text.startsWith(fence)) {
    text = text.slice(fence.length).replace(/^json\s*/i, "");
  }
  if (text.endsWith(fence)) text = text.slice(0, -fence.length);
  return text.trim();
}

function extractJsonObject(value: string) {
  const text = stripCodeFences(value);
  const start = text.indexOf("{");
  if (start < 0) throw new Error("Invalid AI enhancement: JSON object not found.");
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < text.length; index += 1) {
    const character = text[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') inString = true;
    else if (character === "{") depth += 1;
    else if (character === "}") {
      depth -= 1;
      if (depth === 0) return text.slice(start, index + 1);
    }
  }
  return text.slice(start);
}

function sanitizeJson(value: string) {
  let inString = false;
  let escaped = false;
  let output = "";
  for (const character of value) {
    if (inString) {
      if (escaped) {
        output += character;
        escaped = false;
      } else if (character === "\\") {
        output += character;
        escaped = true;
      } else if (character === '"') {
        output += character;
        inString = false;
      } else if (character === "\n") output += "\\n";
      else if (character === "\r") output += "\\r";
      else if (character === "\t") output += "\\t";
      else output += character;
    } else {
      output += character;
      if (character === '"') inString = true;
    }
  }
  return output.replace(/,\s*([}\]])/g, "$1");
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
  if (!isRecord(value) || typeof value.activityId !== "string") return null;
  return { activityId: value.activityId, title: optionalString(value.title), description: optionalString(value.description), localTip: optionalString(value.localTip) };
}
function parseDayEnhancement(value: unknown): AiDayEnhancement | null {
  if (!isRecord(value) || typeof value.day !== "number") return null;
  const rawActivities = Array.isArray(value.activityEnhancements) ? value.activityEnhancements : [];
  return {
    day: value.day,
    dayTitle: optionalString(value.dayTitle),
    daySummary: optionalString(value.daySummary),
    weatherTip: optionalString(value.weatherTip),
    activityEnhancements: rawActivities.map(parseActivityEnhancement).filter((activity): activity is AiActivityEnhancement => activity !== null),
  };
}

export function parseAiEnhancement(rawText: string): AiItineraryEnhancement {
  const jsonText = sanitizeJson(extractJsonObject(rawText));
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    throw new Error("Invalid AI enhancement JSON: " + (error instanceof Error ? error.message : "unknown parse error"));
  }
  if (!isRecord(parsed) || typeof parsed.tripSummary !== "string") throw new Error("Invalid AI enhancement: missing trip summary.");
  if (!isStringArray(parsed.tripTips)) throw new Error("Invalid AI enhancement: missing trip tips.");
  if (!Array.isArray(parsed.dayEnhancements)) throw new Error("Invalid AI enhancement: missing day enhancements.");
  return {
    tripSummary: parsed.tripSummary.trim(),
    tripTips: parsed.tripTips.map((tip) => tip.trim()).filter(Boolean),
    dayEnhancements: parsed.dayEnhancements.map(parseDayEnhancement).filter((day): day is AiDayEnhancement => day !== null),
  };
}