"use client";

import { Check, LoaderCircle, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { AuthPromptModal } from "@/features/auth/components/AuthPromptModal";
import { useSaveTrip } from "../hooks/useSaveTrip";
import type { SaveTripInput } from "../types";
import styles from "./SaveTripButton.module.scss";

type SaveTripButtonProps = {
  trip: SaveTripInput | null;
};

export function SaveTripButton({ trip }: SaveTripButtonProps) {
  const trips = useTranslations("Trips");
  const { authPromptModalProps, error, isSaved, isSaving, saveGeneratedTrip } = useSaveTrip(trip);
  const isDisabled = !trip || isSaving || isSaved;

  return (
    <div className={styles.saveTripControl}>
      <button
        className={styles.saveTripButton}
        type="button"
        onClick={() => void saveGeneratedTrip()}
        disabled={isDisabled}
        aria-describedby={error ? "save-trip-message" : undefined}
      >
        {isSaving ? <LoaderCircle className={styles.spinIcon} size={17} aria-hidden="true" /> : null}
        {isSaved ? <Check size={17} aria-hidden="true" /> : null}
        {!isSaving && !isSaved ? <Save size={17} aria-hidden="true" /> : null}
        <span>{isSaving ? trips("saving") : isSaved ? trips("saved") : trips("saveTrip")}</span>
      </button>
      {isSaved ? (
        <p className={styles.successMessage} role="status">
          {trips("saveSuccess")}
        </p>
      ) : null}
      {error ? (
        <p className={styles.errorMessage} id="save-trip-message" role="alert">
          {trips("saveError")}
        </p>
      ) : null}
      <AuthPromptModal {...authPromptModalProps} />
    </div>
  );
}
