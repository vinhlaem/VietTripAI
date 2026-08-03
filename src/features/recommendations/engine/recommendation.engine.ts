import type { NormalizedPlace, PlaceCategory } from "@/features/places/types";
import type { DynamicInterest, TripRecommendations } from "../types";

const DEFAULT_INTERESTS = ["Beach", "Coffee", "Local food", "Culture", "Nature", "Photography", "Family friendly"];
const interestCategoryMap: Record<string, PlaceCategory[]> = {
  Beach: ["beach"], Coffee: ["cafe"], "Local food": ["restaurant", "fastFood"],
  Culture: ["museum", "historicSite"], Nature: ["nature", "park", "viewpoint", "beach"],
  "Night market": ["nightlife", "entertainment"], Stay: ["hotel", "hostel", "guestHouse"],
  Entertainment: ["entertainment", "nightlife"],
};
const tagLabels: Record<string, { vi: string; en: string }> = {
  beach: { vi: "Biển & nghỉ dưỡng", en: "Beach & relaxation" },
  coffee: { vi: "Cà phê địa phương", en: "Local coffee" },
  "local-food": { vi: "Ẩm thực địa phương", en: "Local cuisine" },
  culture: { vi: "Văn hóa & di sản", en: "Culture & heritage" },
  nature: { vi: "Thiên nhiên & cảnh quan", en: "Nature & scenery" },
  photography: { vi: "Điểm chụp ảnh", en: "Photography spots" },
  "night-market": { vi: "Chợ đêm & phố đi bộ", en: "Night markets & walking streets" },
  family: { vi: "Trải nghiệm gia đình", en: "Family experiences" },
  entertainment: { vi: "Vui chơi & giải trí", en: "Entertainment" },
  stay: { vi: "Lưu trú thuận tiện", en: "Convenient stays" },
  wellness: { vi: "Spa & thư giãn", en: "Spa & wellness" },
  indoor: { vi: "Trải nghiệm trong nhà", en: "Indoor experiences" },
  sport: { vi: "Hoạt động ngoài trời", en: "Outdoor activities" },
  spiritual: { vi: "Tâm linh & kiến trúc", en: "Spiritual & architecture" },
  shopping: { vi: "Chợ & mua sắm địa phương", en: "Local markets & shopping" },
};
const defaultToTag: Record<string, string> = {
  Beach: "beach", Coffee: "coffee", "Local food": "local-food", Culture: "culture",
  Nature: "nature", Photography: "photography", "Night market": "night-market",
  "Family friendly": "family", Stay: "stay", Entertainment: "entertainment",
};
function normalizeInterest(interest: string) {
  return interest.startsWith("local:") ? interest.split(":")[1] : interest;
}
function rankPlaces(places: NormalizedPlace[], interests: string[], limit: number) {
  return [...places].sort((first, second) => {
    const normalized = interests.map(normalizeInterest);
    const firstMatch = normalized.some((interest) => interestCategoryMap[interest]?.includes(first.category)) ? 1 : 0;
    const secondMatch = normalized.some((interest) => interestCategoryMap[interest]?.includes(second.category)) ? 1 : 0;
    return secondMatch - firstMatch || (first.distance ?? Number.MAX_SAFE_INTEGER) - (second.distance ?? Number.MAX_SAFE_INTEGER);
  }).slice(0, limit);
}
export function buildTripRecommendations(places: NormalizedPlace[], interests: string[]): TripRecommendations {
  return {
    hotels: rankPlaces(places.filter((place) => place.group === "hotel"), interests, 4),
    food: rankPlaces(places.filter((place) => place.group === "food"), interests, 6),
    entertainment: rankPlaces(places.filter((place) => place.group === "entertainment"), interests, 4),
  };
}
function derivePlaceTags(places: NormalizedPlace[]) {
  const tags = new Set<string>();
  for (const place of places) {
    const categories = place.sourceCategories ?? [];
    if (place.category === "beach") tags.add("beach");
    if (["museum", "historicSite"].includes(place.category)) tags.add("culture");
    if (["nature", "park", "viewpoint"].includes(place.category)) tags.add("nature");
    if (place.category === "cafe") tags.add("coffee");
    if (["restaurant", "fastFood"].includes(place.category)) tags.add("local-food");
    if (place.group === "hotel") tags.add("stay");
    if (place.group === "entertainment") tags.add("entertainment");
    if (categories.some((category) => category.includes("marketplace"))) tags.add("shopping");
    if (categories.some((category) => category.includes("religion"))) tags.add("spiritual");
    if (categories.some((category) => category.includes("sport"))) tags.add("sport");
    if (categories.some((category) => category.includes("spa") || category.includes("wellness"))) tags.add("wellness");
  }
  return tags;
}
type DynamicInterestInput = {
  areaName?: string;
  areaTags?: string[];
  attractions: NormalizedPlace[];
  recommendations: NormalizedPlace[];
  locale: "vi" | "en";
  isRainy?: boolean;
  travelParty?: "solo" | "couple" | "family" | "friends";
  pace?: "relaxed" | "balanced" | "active";
  preferredTags?: string[];
};
export function deriveDynamicInterests({ areaTags = [], attractions, recommendations, locale, isRainy, travelParty, pace, preferredTags = [] }: DynamicInterestInput): DynamicInterest[] {
  const allPlaces = [...attractions, ...recommendations];
  const placeTags = derivePlaceTags(allPlaces);
  const contextualTags = [...preferredTags, ...areaTags, ...placeTags, ...(isRainy ? ["indoor"] : []), ...(travelParty === "family" ? ["family"] : []), ...(pace === "active" ? ["sport"] : [])];
  const orderedTags = [...new Set(contextualTags)].filter((tag) => tag !== "stay");
  const dynamic = orderedTags.filter((tag) => tagLabels[tag]).slice(0, 10).map((tag) => {
    const baseLabel = tagLabels[tag][locale];
    const label = baseLabel;
    return {
      id: "local:" + tag,
      label,
      availableCount: areaTags.includes(tag) ? undefined : (allPlaces.filter((place) => derivePlaceTags([place]).has(tag)).length || undefined),
      source: areaTags.includes(tag) ? "area" as const : "places" as const,
    };
  });
  if (dynamic.length) return dynamic;
  return DEFAULT_INTERESTS.map((id) => ({ id, label: tagLabels[defaultToTag[id]]?.[locale] ?? id, source: "fallback" as const }));
}