import { MapPin, Navigation } from "lucide-react";
import { Popup } from "react-leaflet";
import { useTranslations } from "next-intl";
import type { TripMapLocation } from "../types";
import styles from "./TripMap.module.scss";

type MapMarkerPopupProps = {
  location: TripMapLocation;
};

export function MapMarkerPopup({ location }: MapMarkerPopupProps) {
  const places = useTranslations("Places");

  return (
    <Popup className={styles.popup} closeButton={false} minWidth={220}>
      <article className={styles.popupContent}>
        <div className={styles.popupIcon} aria-hidden="true">
          <MapPin size={17} />
        </div>
        <div>
          <h3>{location.name}</h3>
          <div className={styles.popupMeta}>
            <span>{places(`categoryLabels.${location.category}`)}</span>
            {location.distance != null ? (
              <span>
                <Navigation size={13} aria-hidden="true" />
                {location.distance >= 1000
                  ? places("distanceKilometers", { value: (location.distance / 1000).toFixed(1) })
                  : places("distanceMeters", { value: Math.round(location.distance) })}
              </span>
            ) : null}
          </div>
          <p>{location.address ?? places("addressUnavailable")}</p>
        </div>
      </article>
    </Popup>
  );
}
