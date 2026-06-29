"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  ZoomControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { MapPinned } from "lucide-react";
import { useTranslations } from "next-intl";
import { daNangMapCenter } from "../data/mockLocations";
import type { MapCenter, TripMapLocation } from "../types";
import { MapMarkerPopup } from "./MapMarkerPopup";
import styles from "./TripMap.module.scss";

type TripMapProps = {
  center?: MapCenter | null;
  hasLocationError?: boolean;
  isLocationLoading?: boolean;
  locations?: TripMapLocation[];
  onSelectLocation?: (locationId: string) => void;
  selectedLocationId?: string | null;
};

type RecenterMapProps = {
  center?: MapCenter | null;
};

type FocusSelectedMarkerProps = {
  location?: TripMapLocation;
  markerRefs: React.MutableRefObject<Map<string, L.Marker>>;
};

function RecenterMap({ center }: RecenterMapProps) {
  const map = useMap();

  useEffect(() => {
    if (!center) {
      return;
    }

    map.setView([center.latitude, center.longitude], map.getZoom(), {
      animate: true,
    });
  }, [center, map]);

  return null;
}

function FocusSelectedMarker({ location, markerRefs }: FocusSelectedMarkerProps) {
  const map = useMap();

  useEffect(() => {
    if (!location) {
      return;
    }

    map.setView([location.latitude, location.longitude], Math.max(map.getZoom(), 13), {
      animate: true,
    });
    markerRefs.current.get(location.id)?.openPopup();
  }, [location, map, markerRefs]);

  return null;
}

export function TripMap({
  center,
  hasLocationError = false,
  isLocationLoading = false,
  locations = [],
  onSelectLocation,
  selectedLocationId,
}: TripMapProps) {
  const map = useTranslations("Map");
  const [isMounted, setIsMounted] = useState(false);
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const initialCenter = center ?? daNangMapCenter;
  const selectedLocation = locations.find((location) => location.id === selectedLocationId);

  const markerIcon = useMemo(
    () =>
      L.divIcon({
        className: styles.markerIcon,
        html: `<span>${map("markerLabel")}</span>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18],
      }),
    [map],
  );

  const activeMarkerIcon = useMemo(
    () =>
      L.divIcon({
        className: `${styles.markerIcon} ${styles.markerIconActive}`,
        html: `<span>${map("selectedMarkerLabel")}</span>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -20],
      }),
    [map],
  );

  return (
    <section className={styles.mapCard} aria-labelledby="trip-map-title">
      <div className={styles.mapHeader}>
        <span className={styles.mapIcon} aria-hidden="true">
          <MapPinned size={19} />
        </span>
        <div>
          <span className={styles.eyebrow}>{map("eyebrow")}</span>
          <h2 id="trip-map-title">{map("title")}</h2>
          <p>{map("description", { count: locations.length })}</p>
          {isLocationLoading ? (
            <span className={styles.mapStatus}>{map("locationLoading")}</span>
          ) : null}
          {hasLocationError ? (
            <span className={`${styles.mapStatus} ${styles.mapStatusError}`}>
              {map("locationError")}
            </span>
          ) : null}
        </div>
      </div>

      <div className={styles.mapShell}>
        {!isMounted ? (
          <div className={styles.mapSkeleton} aria-label={map("loading")} />
        ) : (
          <MapContainer
            center={[initialCenter.latitude, initialCenter.longitude]}
            className={styles.mapCanvas}
            scrollWheelZoom
            touchZoom
            zoom={11}
            zoomControl={false}
          >
            <RecenterMap center={center} />
            <FocusSelectedMarker location={selectedLocation} markerRefs={markerRefs} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ZoomControl position="bottomright" />
            {locations.map((location) => (
              <Marker
                eventHandlers={{
                  click: () => onSelectLocation?.(location.id),
                }}
                icon={selectedLocationId === location.id ? activeMarkerIcon : markerIcon}
                key={location.id}
                position={[location.latitude, location.longitude]}
                ref={(marker) => {
                  if (marker) {
                    markerRefs.current.set(location.id, marker);

                    if (selectedLocationId === location.id) {
                      marker.openPopup();
                    }
                  } else {
                    markerRefs.current.delete(location.id);
                  }
                }}
              >
                <MapMarkerPopup location={location} />
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </section>
  );
}

