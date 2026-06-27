import { ImageIcon, MapPin, Navigation } from "lucide-react";
import { useTranslations } from "next-intl";
import type { NormalizedPlace } from "../types";
import styles from "./Places.module.scss";

type PlaceCardProps = {
  isActive?: boolean;
  onSelect: (place: NormalizedPlace) => void;
  place: NormalizedPlace;
};

export function PlaceCard({ isActive = false, onSelect, place }: PlaceCardProps) {
  const places = useTranslations("Places");

  return (
    <button
      className={`${styles.placeCard} ${isActive ? styles.placeCardActive : ""}`}
      onClick={() => onSelect(place)}
      type="button"
      aria-pressed={isActive}
      aria-label={places("selectPlace", { name: place.name })}
    >
      <span className={styles.placeMedia} aria-hidden="true">
        {place.image ? null : <ImageIcon size={18} />}
      </span>
      <span className={styles.placeBody}>
        <span className={styles.placeTopline}>
          <strong>{place.name}</strong>
          {place.distance != null ? (
            <small>
              <Navigation size={13} aria-hidden="true" />
              {place.distance >= 1000
                ? places("distanceKilometers", { value: (place.distance / 1000).toFixed(1) })
                : places("distanceMeters", { value: Math.round(place.distance) })}
            </small>
          ) : null}
        </span>
        <span className={styles.placeMeta}>
          <span>{places(`categoryLabels.${place.category}`)}</span>
          <span>
            <MapPin size={13} aria-hidden="true" />
            {place.address ?? places("addressUnavailable")}
          </span>
        </span>
      </span>
    </button>
  );
}
