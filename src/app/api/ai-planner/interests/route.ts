import { NextRequest, NextResponse } from "next/server";
import { generateInterestsOnServer } from "@/features/recommendations/server/generateInterests.server";
import type { AiInterestRequest } from "@/features/recommendations/types";

function valid(value: unknown): value is AiInterestRequest {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (v.locale === "vi" || v.locale === "en") && typeof v.province === "string" &&
    typeof v.areaName === "string" && Array.isArray(v.areaTags) && Array.isArray(v.placeSignals) &&
    ["solo", "couple", "family", "friends"].includes(String(v.travelParty)) &&
    ["relaxed", "balanced", "active"].includes(String(v.pace)) &&
    ["standard", "limitedMobility"].includes(String(v.accessibility)) &&
    typeof v.indoorPreference === "boolean" && Array.isArray(v.preferredTags);
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
  if (!valid(body)) return NextResponse.json({ error: "Invalid AI interests request." }, { status: 400 });
  return NextResponse.json(await generateInterestsOnServer(body));
}