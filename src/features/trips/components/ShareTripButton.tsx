"use client";

import { Check, Copy, ExternalLink, Loader2, Share2, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { createShareLink, disableShareLink } from "../api/trips.client";
import type { SavedTrip } from "../types";
import styles from "./ShareTripButton.module.scss";

type ShareTripButtonProps = {
  trip: SavedTrip;
};

type NavigatorWithOptionalShare = Navigator & {
  share?: (data: ShareData) => Promise<void>;
};

function buildShareUrl(slug: string, locale: string) {
  const safeLocale = locale === "en" ? "en" : "vi";
  const origin = typeof window === "undefined" ? "" : window.location.origin;

  return `${origin}/${safeLocale}/share/${slug}`;
}

function getNativeShare() {
  if (typeof navigator === "undefined") {
    return undefined;
  }

  return (navigator as NavigatorWithOptionalShare).share;
}

export function ShareTripButton({ trip }: ShareTripButtonProps) {
  const trips = useTranslations("Trips");
  const locale = useLocale();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [isShareDisabled, setIsShareDisabled] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const existingShareUrl = useMemo(() => {
    if (isShareDisabled || !trip.share?.enabled || !trip.share.slug) {
      return null;
    }

    return buildShareUrl(trip.share.slug, locale);
  }, [isShareDisabled, locale, trip.share]);

  async function ensureShareLink() {
    if (shareUrl || existingShareUrl) {
      setShareUrl(shareUrl ?? existingShareUrl);
      return;
    }

    if (!user) {
      setErrorMessage(trips("shareError"));
      return;
    }

    setIsCreating(true);
    setErrorMessage(null);

    try {
      const result = await createShareLink(user.uid, trip.id, locale);
      setIsShareDisabled(false);
      setShareUrl(result.url);
    } catch {
      setErrorMessage(trips("shareError"));
    } finally {
      setIsCreating(false);
    }
  }

  async function handleOpen() {
    setIsOpen(true);
    setHasCopied(false);
    setErrorMessage(null);
    await ensureShareLink();
  }

  function handleClose() {
    setIsOpen(false);
    setHasCopied(false);
  }

  async function handleCopy() {
    if (!shareUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setHasCopied(true);
    } catch {
      setErrorMessage(trips("copyError"));
    }
  }

  function handleOpenInNewTab() {
    if (!shareUrl) {
      return;
    }

    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }

  async function handleNativeShare() {
    const nativeShare = getNativeShare();

    if (!shareUrl || typeof nativeShare !== "function") {
      return;
    }

    try {
      await nativeShare.call(navigator, {
        title: trips("shareTitle"),
        text: trips("shareDescription"),
        url: shareUrl,
      });
    } catch {
      // The user can cancel the native share sheet; keep the popover open.
    }
  }

  async function handleDisableShareLink() {
    if (!user || !shareUrl) {
      return;
    }

    setIsDisabling(true);
    setErrorMessage(null);

    try {
      await disableShareLink(user.uid, trip.id);
      setIsShareDisabled(true);
      setShareUrl(null);
      setHasCopied(false);
    } catch {
      setErrorMessage(trips("shareError"));
    } finally {
      setIsDisabling(false);
    }
  }

  const canUseNativeShare = typeof getNativeShare() === "function";

  return (
    <div className={styles.shareControl}>
      <button
        className={styles.shareButton}
        type="button"
        onClick={handleOpen}
        aria-expanded={isOpen}
      >
        <Share2 size={17} aria-hidden="true" />
        {trips("share")}
      </button>

      {isOpen ? (
        <div className={styles.sharePopover} role="dialog" aria-label={trips("shareTitle")}>
          <div className={styles.popoverHeader}>
            <div>
              <h2>{trips("shareTitle")}</h2>
              <p>{trips("shareDescription")}</p>
            </div>
            <button
              className={styles.iconButton}
              type="button"
              onClick={handleClose}
              aria-label={trips("closeShare")}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          <div className={styles.linkRow}>
            <input
              aria-label={trips("shareLinkLabel")}
              readOnly
              value={shareUrl ?? ""}
              placeholder={isCreating ? trips("creatingShareLink") : trips("createShareLink")}
            />
            <button
              className={styles.copyButton}
              type="button"
              onClick={handleCopy}
              disabled={!shareUrl}
            >
              {hasCopied ? (
                <Check size={16} aria-hidden="true" />
              ) : (
                <Copy size={16} aria-hidden="true" />
              )}
              {hasCopied ? trips("copied") : trips("copyLink")}
            </button>
          </div>

          {isCreating ? (
            <span className={styles.statusLine} role="status">
              <Loader2 size={15} aria-hidden="true" />
              {trips("creatingShareLink")}
            </span>
          ) : null}

          {shareUrl ? (
            <span className={styles.successLine}>
              <Check size={15} aria-hidden="true" />
              {trips("shareLinkCreated")}
            </span>
          ) : null}

          {errorMessage ? <p className={styles.errorLine}>{errorMessage}</p> : null}

          <div className={styles.shareActions}>
            <button type="button" onClick={handleOpenInNewTab} disabled={!shareUrl}>
              <ExternalLink size={16} aria-hidden="true" />
              {trips("openInNewTab")}
            </button>
            {canUseNativeShare ? (
              <button type="button" onClick={handleNativeShare} disabled={!shareUrl}>
                <Share2 size={16} aria-hidden="true" />
                {trips("shareVia")}
              </button>
            ) : null}
            <button
              className={styles.dangerAction}
              type="button"
              onClick={handleDisableShareLink}
              disabled={!shareUrl || isDisabling}
            >
              {isDisabling ? <Loader2 size={16} aria-hidden="true" /> : <X size={16} aria-hidden="true" />}
              {trips("disableShareLink")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
