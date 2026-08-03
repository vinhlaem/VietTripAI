import type { Place, PlaceCategory } from "@/features/places/types";

const interestCategoryWeights: Record<string, Partial<Record<PlaceCategory, number>>> = {
  Beach: {
    beach: 5,
    viewpoint: 2,
    park: 1,
  },
  Culture: {
    museum: 5,
    historicSite: 5,
    touristAttraction: 2,
  },
  Nature: {
    park: 5,
    viewpoint: 4,
    beach: 2,
  },
  Photography: {
    viewpoint: 5,
    historicSite: 3,
    touristAttraction: 3,
    beach: 2,
  },
  "Local food": {
    touristAttraction: 1,
  },
  Coffee: {
    museum: 1,
    viewpoint: 1,
  },
  "Night market": {
    touristAttraction: 2,
    historicSite: 1,
  },
  "Family friendly": {
    park: 4,
    museum: 3,
    beach: 2,
  },
};

export function getMaxPlacesPerDay(days: number) {
  if (days <= 3) {
    return 3;
  }

  return 2;
}

function normalizeInterest(interest: string) {
  const aliases: Record<string, string> = { beach: "Beach", coffee: "Coffee", "local-food": "Local food", culture: "Culture", nature: "Nature", photography: "Photography", "night-market": "Night market", family: "Family friendly" };
  const value = interest.startsWith("local:") ? interest.split(":")[1] : interest;
  if (aliases[value]) return aliases[value];
  const text = value.toLocaleLowerCase("vi");
  if (/biển|bãi biển|beach|sea|đảo|island/.test(text)) return "Beach";
  if (/cà phê|coffee|cafe/.test(text)) return "Coffee";
  if (/ẩm thực|món ăn|đặc sản|hải sản|food|cuisine|seafood/.test(text)) return "Local food";
  if (/văn hóa|di sản|lịch sử|culture|heritage|history|kiến trúc/.test(text)) return "Culture";
  if (/thiên nhiên|cảnh quan|nature|scenery|núi|sinh thái/.test(text)) return "Nature";
  if (/chụp ảnh|check-in|photo|photography/.test(text)) return "Photography";
  if (/chợ đêm|phố đi bộ|night market/.test(text)) return "Night market";
  if (/gia đình|trẻ em|family|kids/.test(text)) return "Family friendly";
  return value;
}

export function getPlaceInterestScore(place: Place, interests: string[]) {
  const interestScore = interests.reduce((score, interest) => {
    return score + (interestCategoryWeights[normalizeInterest(interest)]?.[place.category] ?? 0);
  }, 0);
  const distanceScore = place.distance == null ? 0 : Math.max(0, 3 - place.distance / 5000);

  return interestScore + distanceScore;
}

export function sortPlacesForPlanner(places: Place[], interests: string[]) {
  return [...places].sort((first, second) => {
    const scoreDifference =
      getPlaceInterestScore(second, interests) - getPlaceInterestScore(first, interests);

    if (scoreDifference !== 0) {
      return scoreDifference;
    }

    return (first.distance ?? Number.MAX_SAFE_INTEGER) -
      (second.distance ?? Number.MAX_SAFE_INTEGER);
  });
}

export function prefersLocalFood(interests: string[]) {
  return interests.map(normalizeInterest).includes("Local food");
}

export function prefersCoffee(interests: string[]) {
  return interests.map(normalizeInterest).includes("Coffee");
}

export function prefersNightMarket(interests: string[]) {
  return interests.map(normalizeInterest).includes("Night market");
}
