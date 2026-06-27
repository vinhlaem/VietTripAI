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

export function getPlaceInterestScore(place: Place, interests: string[]) {
  const interestScore = interests.reduce((score, interest) => {
    return score + (interestCategoryWeights[interest]?.[place.category] ?? 0);
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
  return interests.includes("Local food");
}

export function prefersCoffee(interests: string[]) {
  return interests.includes("Coffee");
}

export function prefersNightMarket(interests: string[]) {
  return interests.includes("Night market");
}
