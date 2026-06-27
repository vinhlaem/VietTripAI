import type { AiEnhancementRequest } from "../types";

export function buildItineraryEnhancementPrompt(request: AiEnhancementRequest) {
  const language = request.locale === "vi" ? "Vietnamese" : "English";
  const context = {
    locale: request.locale,
    destinationArea: request.destination,
    selectedProvince: request.selectedProvince,
    selectedTouristArea: request.selectedTouristArea,
    touristAreaSearchQuery: request.touristAreaSearchQuery,
    days: request.days,
    budget: request.budget,
    interests: request.interests,
    baseItinerary: request.baseItinerary,
    touristPlaces: request.places.map((place) => ({
      id: place.id,
      name: place.name,
      category: place.category,
      address: place.address,
      distance: place.distance,
      source: place.source,
    })),
    weather: request.weather,
  };

  return [
    "You are enhancing a travel itinerary for VietTrip AI.",
    `Write all user-facing text in ${language}.`,
    "The selected destination is a travel area. The tourist places are provided separately.",
    "Use only the provided tourist places for attractions. Do not treat the destination area as an attraction.",
    "Use only the provided itinerary activities and tourist places.",
    "Do not invent new attractions, restaurants, hotels, routes, or unrelated places.",
    "Do not change the number of days.",
    "Do not change, remove, or invent activity IDs.",
    "Do not change budget totals or cost categories.",
    "Do not remove activities.",
    "Improve descriptions, daily summaries, weather-aware travel tips, practical notes, wording quality, and local travel advice only.",
    "Consider the selected interests and available weather data.",
    "Return valid JSON only. Do not return markdown. Do not wrap JSON in code fences. Do not explain outside JSON.",
    "The JSON shape must be:",
    JSON.stringify({
      tripSummary: "string",
      tripTips: ["string"],
      dayEnhancements: [
        {
          day: 1,
          dayTitle: "string optional",
          daySummary: "string optional",
          weatherTip: "string optional",
          activityEnhancements: [
            {
              activityId: "existing activity id only",
              title: "string optional",
              description: "string optional",
              localTip: "string optional",
            },
          ],
        },
      ],
    }),
    "Context:",
    JSON.stringify(context),
  ].join("\n");
}

