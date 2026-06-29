"use client";

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  writeBatch,
  type DocumentData,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { getFirebaseDb } from "@/features/firebase/firebase.client";
import type {
  SavedTrip,
  SaveTripInput,
  ShareLinkResult,
  ShareTripMapping,
  TripDocumentPath,
  TripShareInfo,
} from "../types";
import { getUserTripDocPath, getUserTripsCollectionPath } from "../utils/tripPaths";

type FirestoreSafeValue =
  | string
  | number
  | boolean
  | null
  | FirestoreSafeValue[]
  | { [key: string]: FirestoreSafeValue };

const SHARE_TRIPS_COLLECTION = "shareTrips";
const SHARE_SLUG_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const SHARE_SLUG_LENGTH = 9;
const SHARE_SLUG_PATTERN = /^[a-z0-9]{6,12}$/;
const MAX_SHARE_SLUG_ATTEMPTS = 8;

function createSafeTripError(message: string) {
  return new Error(message);
}

function getErrorDetails(error: unknown) {
  if (error && typeof error === "object") {
    const candidate = error as {
      code?: unknown;
      message?: unknown;
      name?: unknown;
    };

    return {
      code: typeof candidate.code === "string" ? candidate.code : undefined,
      message:
        typeof candidate.message === "string" ? candidate.message : undefined,
      name: typeof candidate.name === "string" ? candidate.name : undefined,
    };
  }

  return {
    message: typeof error === "string" ? error : undefined,
  };
}

function logTripOperationError(operation: string, error: unknown) {
  console.error(`[trips] ${operation} failed`, getErrorDetails(error));
}

function toFirestoreSafeValue(value: unknown): FirestoreSafeValue | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (Array.isArray(value)) {
    return value
      .map(toFirestoreSafeValue)
      .filter((entry): entry is FirestoreSafeValue => entry !== undefined);
  }

  if (value && typeof value === "object") {
    return Object.entries(value).reduce<Record<string, FirestoreSafeValue>>(
      (accumulator, [key, entry]) => {
        const nextValue = toFirestoreSafeValue(entry);

        if (nextValue !== undefined) {
          accumulator[key] = nextValue;
        }

        return accumulator;
      },
      {},
    );
  }

  return undefined;
}

function toFirestoreSafeRecord(value: unknown): Record<string, FirestoreSafeValue> {
  const sanitizedValue = toFirestoreSafeValue(value);

  if (
    !sanitizedValue ||
    Array.isArray(sanitizedValue) ||
    typeof sanitizedValue !== "object"
  ) {
    throw createSafeTripError("Unable to save trip.");
  }

  return sanitizedValue;
}

function toFirestoreSafeObject(value: SavedTrip): Record<string, FirestoreSafeValue> {
  return toFirestoreSafeRecord(value);
}

function validateUserId(userId: string, message = "Unable to save trip.") {
  if (!userId.trim()) {
    throw createSafeTripError(message);
  }
}

function validateTripId(tripId: string, message = "Unable to load trip.") {
  if (!tripId.trim()) {
    throw createSafeTripError(message);
  }
}

function validateShareSlug(slug: string) {
  if (!SHARE_SLUG_PATTERN.test(slug)) {
    throw createSafeTripError("Unable to load shared trip.");
  }
}

function validateSaveTripInput(input: SaveTripInput) {
  if (!input.destination.trim()) {
    throw createSafeTripError("Unable to save trip.");
  }

  if (!Number.isFinite(input.days) || input.days < 1) {
    throw createSafeTripError("Unable to save trip.");
  }

  if (!Number.isFinite(input.budget) || input.budget < 0) {
    throw createSafeTripError("Unable to save trip.");
  }

  if (!Array.isArray(input.interests)) {
    throw createSafeTripError("Unable to save trip.");
  }

  if (!input.itinerary || typeof input.itinerary !== "object") {
    throw createSafeTripError("Unable to save trip.");
  }

  if (!Array.isArray(input.places)) {
    throw createSafeTripError("Unable to save trip.");
  }
}

function createSavedTrip(userId: string, tripId: string, input: SaveTripInput): SavedTrip {
  const now = new Date().toISOString();

  return {
    id: tripId,
    userId,
    destination: input.destination,
    ...(input.province ? { province: input.province } : {}),
    ...(input.touristArea ? { touristArea: input.touristArea } : {}),
    days: input.days,
    budget: input.budget,
    interests: input.interests,
    itinerary: input.itinerary,
    places: input.places,
    weather: input.weather,
    ...(input.aiSource ? { aiSource: input.aiSource } : {}),
    createdAt: input.createdAt ?? now,
    updatedAt: now,
  };
}

function throwSafeTripError(operation: string, error: unknown, message: string): never {
  logTripOperationError(operation, error);
  throw createSafeTripError(message);
}

function isTripShareInfo(value: unknown): value is TripShareInfo {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<TripShareInfo>;

  return (
    typeof candidate.enabled === "boolean" &&
    typeof candidate.slug === "string" &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.updatedAt === "string"
  );
}

function isShareTripMapping(value: unknown): value is ShareTripMapping {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ShareTripMapping>;

  return (
    typeof candidate.userId === "string" &&
    typeof candidate.tripId === "string" &&
    typeof candidate.createdAt === "string"
  );
}

function isSavedTrip(value: Partial<SavedTrip>, documentId: string): value is SavedTrip {
  return (
    typeof value.userId === "string" &&
    typeof value.destination === "string" &&
    typeof value.days === "number" &&
    typeof value.budget === "number" &&
    Array.isArray(value.interests) &&
    typeof value.itinerary === "object" &&
    value.itinerary !== null &&
    Array.isArray(value.places) &&
    "weather" in value &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string" &&
    (value.id === undefined || value.id === documentId)
  );
}

function normalizeTripSnapshot(
  snapshot: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>,
): SavedTrip | null {
  const data = snapshot.data() as Partial<SavedTrip> | undefined;

  if (!data || !isSavedTrip(data, snapshot.id)) {
    return null;
  }

  const { share: rawShare, ...tripData } = data;
  const share = isTripShareInfo(rawShare) ? rawShare : undefined;

  return {
    ...tripData,
    ...(share ? { share } : {}),
    id: snapshot.id,
  };
}

function getTripCollectionRef(userId: string) {
  return collection(getFirebaseDb(), getUserTripsCollectionPath(userId));
}

function getTripDocRef(userId: string, tripId: string) {
  return doc(getFirebaseDb(), getUserTripDocPath(userId, tripId));
}

function getShareDocRef(slug: string) {
  return doc(getFirebaseDb(), SHARE_TRIPS_COLLECTION, slug);
}

function generateShareSlug() {
  const randomValues = new Uint8Array(SHARE_SLUG_LENGTH);

  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(randomValues);
  } else {
    for (let index = 0; index < randomValues.length; index += 1) {
      randomValues[index] = Math.floor(Math.random() * 256);
    }
  }

  return Array.from(randomValues, (value) => SHARE_SLUG_ALPHABET[value % SHARE_SLUG_ALPHABET.length]).join("");
}

async function createUniqueShareSlug() {
  for (let attempt = 0; attempt < MAX_SHARE_SLUG_ATTEMPTS; attempt += 1) {
    const slug = generateShareSlug();
    const snapshot = await getDoc(getShareDocRef(slug));

    if (!snapshot.exists()) {
      return slug;
    }
  }

  throw createSafeTripError("Unable to create share link.");
}

function getShareUrl(slug: string, locale: string) {
  const safeLocale = locale === "en" ? "en" : "vi";
  const origin = typeof window === "undefined" ? "" : window.location.origin;

  return `${origin}/${safeLocale}/share/${slug}`;
}

export function getTripDocumentPath(userId: string, tripId: string): TripDocumentPath {
  return getUserTripDocPath(userId, tripId);
}

export async function saveTrip(userId: string, input: SaveTripInput): Promise<SavedTrip> {
  try {
    validateUserId(userId);
    validateSaveTripInput(input);
    const tripRef = input.id ? getTripDocRef(userId, input.id) : doc(getTripCollectionRef(userId));
    const savedTrip = createSavedTrip(userId, tripRef.id, input);

    await setDoc(tripRef, toFirestoreSafeObject(savedTrip));

    return savedTrip;
  } catch (error) {
    throwSafeTripError("saveTrip", error, "Unable to save trip.");
  }
}

export async function getUserTrips(userId: string): Promise<SavedTrip[]> {
  try {
    validateUserId(userId, "Unable to load trips.");
    const tripsQuery = query(getTripCollectionRef(userId), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(tripsQuery);

    return snapshot.docs
      .map((tripSnapshot: QueryDocumentSnapshot<DocumentData>) => normalizeTripSnapshot(tripSnapshot))
      .filter((trip: SavedTrip | null): trip is SavedTrip => trip !== null);
  } catch (error) {
    throwSafeTripError("getUserTrips", error, "Unable to load trips.");
  }
}

export async function getTripById(userId: string, tripId: string): Promise<SavedTrip | null> {
  try {
    validateUserId(userId, "Unable to load trip.");
    validateTripId(tripId);
    const snapshot = await getDoc(getTripDocRef(userId, tripId));

    return normalizeTripSnapshot(snapshot);
  } catch (error) {
    throwSafeTripError("getTripById", error, "Unable to load trip.");
  }
}

export async function getTripByShareSlug(slug: string): Promise<SavedTrip | null> {
  try {
    validateShareSlug(slug);
    const shareSnapshot = await getDoc(getShareDocRef(slug));

    if (!shareSnapshot.exists()) {
      return null;
    }

    const shareData = shareSnapshot.data();

    if (!isShareTripMapping(shareData)) {
      return null;
    }

    const tripSnapshot = await getDoc(getTripDocRef(shareData.userId, shareData.tripId));
    const trip = normalizeTripSnapshot(tripSnapshot);

    if (!trip || !trip.share?.enabled || trip.share.slug !== slug) {
      return null;
    }

    return trip;
  } catch (error) {
    throwSafeTripError("getTripByShareSlug", error, "Unable to load shared trip.");
  }
}

export async function createShareLink(
  userId: string,
  tripId: string,
  locale: string,
): Promise<ShareLinkResult> {
  try {
    validateUserId(userId, "Unable to create share link.");
    validateTripId(tripId, "Unable to create share link.");

    const tripRef = getTripDocRef(userId, tripId);
    const tripSnapshot = await getDoc(tripRef);
    const trip = normalizeTripSnapshot(tripSnapshot);

    if (!trip || trip.userId !== userId) {
      throw createSafeTripError("Unable to create share link.");
    }

    if (trip.share?.enabled && trip.share.slug) {
      return {
        slug: trip.share.slug,
        url: getShareUrl(trip.share.slug, locale),
      };
    }

    const slug = await createUniqueShareSlug();
    const now = new Date().toISOString();
    const share: TripShareInfo = {
      enabled: true,
      slug,
      createdAt: now,
      updatedAt: now,
    };
    const shareMapping: ShareTripMapping = {
      userId,
      tripId,
      createdAt: now,
    };

    const batch = writeBatch(getFirebaseDb());
    batch.update(tripRef, toFirestoreSafeRecord({ share, updatedAt: now }));
    batch.set(getShareDocRef(slug), toFirestoreSafeRecord(shareMapping));
    await batch.commit();

    return {
      slug,
      url: getShareUrl(slug, locale),
    };
  } catch (error) {
    throwSafeTripError("createShareLink", error, "Unable to create share link.");
  }
}

export async function disableShareLink(userId: string, tripId: string): Promise<void> {
  try {
    validateUserId(userId, "Unable to disable share link.");
    validateTripId(tripId, "Unable to disable share link.");

    const tripRef = getTripDocRef(userId, tripId);
    const tripSnapshot = await getDoc(tripRef);
    const trip = normalizeTripSnapshot(tripSnapshot);

    if (!trip?.share?.slug) {
      return;
    }

    const now = new Date().toISOString();
    const batch = writeBatch(getFirebaseDb());
    batch.update(
      tripRef,
      toFirestoreSafeRecord({
        share: {
          ...trip.share,
          enabled: false,
          updatedAt: now,
        },
        updatedAt: now,
      }),
    );
    batch.delete(getShareDocRef(trip.share.slug));
    await batch.commit();
  } catch (error) {
    throwSafeTripError("disableShareLink", error, "Unable to disable share link.");
  }
}

export async function deleteTrip(userId: string, tripId: string): Promise<void> {
  try {
    validateUserId(userId, "Unable to delete trip.");
    validateTripId(tripId, "Unable to delete trip.");
    await deleteDoc(getTripDocRef(userId, tripId));
  } catch (error) {
    throwSafeTripError("deleteTrip", error, "Unable to delete trip.");
  }
}
