export type UserTripsCollectionPath = `users/${string}/trips`;
export type UserTripDocumentPath = `users/${string}/trips/${string}`;

function assertNonEmptyId(value: string, label: string) {
  if (!value.trim()) {
    throw new Error(`${label} is required.`);
  }
}

export function getUserTripsCollectionPath(userId: string): UserTripsCollectionPath {
  assertNonEmptyId(userId, "userId");

  return `users/${userId}/trips`;
}

export function getUserTripDocPath(userId: string, tripId: string): UserTripDocumentPath {
  assertNonEmptyId(userId, "userId");
  assertNonEmptyId(tripId, "tripId");

  return `users/${userId}/trips/${tripId}`;
}
