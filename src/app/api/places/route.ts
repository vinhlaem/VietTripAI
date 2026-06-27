import { NextRequest, NextResponse } from "next/server";
import { getNearbyTouristPlaces } from "@/features/places/api/geoapifyPlaces.server";

export const dynamic = "force-dynamic";

function parseCoordinate(value: string | null) {
  if (value === null) {
    return null;
  }

  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate : null;
}

export async function GET(request: NextRequest) {
  const latitude = parseCoordinate(request.nextUrl.searchParams.get("latitude"));
  const longitude = parseCoordinate(request.nextUrl.searchParams.get("longitude"));

  if (latitude === null || longitude === null) {
    return NextResponse.json(
      { error: "Invalid latitude or longitude." },
      { status: 400 },
    );
  }

  try {
    const places = await getNearbyTouristPlaces(
      latitude,
      longitude,
      request.signal,
    );

    return NextResponse.json({ places });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Unable to load tourist places." },
      { status: 500 },
    );
  }
}

