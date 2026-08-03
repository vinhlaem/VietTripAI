"use client";

import { BedDouble, ExternalLink, Gamepad2, Utensils } from "lucide-react";
import { useTranslations } from "next-intl";
import { PlaceCard } from "@/features/places/components/PlaceCard";
import type { NormalizedPlace } from "@/features/places/types";
import type { HotelSearchContext, TripRecommendations } from "../types";
import styles from "./NearbyRecommendations.module.scss";

type Props = {
  hotelSearch?: HotelSearchContext;
  recommendations: TripRecommendations;
  onSelectPlace?: (place: NormalizedPlace) => void;
  selectedPlaceId?: string | null;
};

function hasValidSearch(search: HotelSearchContext) {
  return Boolean(search.checkIn && search.checkOut && search.checkOut > search.checkIn && search.guests > 0);
}

function getSearchQuery(place: NormalizedPlace, search: HotelSearchContext) {
  return [place.name, search.destination].filter(Boolean).join(", ");
}

function buildBookingSearchUrl(place: NormalizedPlace, search: HotelSearchContext) {
  const params = new URLSearchParams({
    ss: getSearchQuery(place, search),
    checkin: search.checkIn,
    checkout: search.checkOut,
    group_adults: String(search.guests),
    no_rooms: "1",
    group_children: "0",
  });
  return "https://www.booking.com/searchresults.html?" + params.toString();
}

function buildGoogleHotelsUrl(place: NormalizedPlace, search: HotelSearchContext) {
  const query = getSearchQuery(place, search) + " hotel " + search.checkIn + " " + search.checkOut;
  return "https://www.google.com/travel/search?q=" + encodeURIComponent(query);
}

export function NearbyRecommendations({ hotelSearch, recommendations, onSelectPlace, selectedPlaceId }: Props) {
  const t = useTranslations("Recommendations");
  const groups = [
    { key: "hotels", icon: BedDouble, places: recommendations.hotels },
    { key: "food", icon: Utensils, places: recommendations.food },
    { key: "entertainment", icon: Gamepad2, places: recommendations.entertainment },
  ] as const;

  if (!groups.some((group) => group.places.length)) return null;

  return (
    <section className={styles.section} aria-labelledby="nearby-recommendations-title">
      <div className={styles.heading}>
        <h2 id="nearby-recommendations-title">{t("title")}</h2>
        <p>{t("description")}</p>
      </div>
      <div className={styles.grid}>
        {groups.map(({ key, icon: Icon, places }) => places.length ? (
          <section className={styles.panel} key={key}>
            <h3><Icon size={18} aria-hidden="true" />{t("groups." + key)}</h3>
            <p>{t("groupDescriptions." + key)}</p>
            <div className={styles.list}>
              {places.map((place) => (
                <div className={styles.item} key={place.id}>
                  <PlaceCard isActive={selectedPlaceId === place.id} onSelect={(value) => onSelectPlace?.(value)} place={place} />
                  {key === "hotels" && hotelSearch && hasValidSearch(hotelSearch) ? (
                    <div className={styles.priceLinks}>
                      <a className={styles.priceLink} href={buildBookingSearchUrl(place, hotelSearch)} target="_blank" rel="noreferrer">{t("checkPriceBooking")}<ExternalLink size={15} aria-hidden="true" /></a>
                      <a className={styles.secondaryPriceLink} href={buildGoogleHotelsUrl(place, hotelSearch)} target="_blank" rel="noreferrer">{t("checkPriceGoogle")}<ExternalLink size={15} aria-hidden="true" /></a>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null)}
      </div>
    </section>
  );
}