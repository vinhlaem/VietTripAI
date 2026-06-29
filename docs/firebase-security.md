# Firebase Security Rules

VietTrip AI stores saved trips under a user-owned Firestore path:

```txt
users/{userId}/trips/{tripId}
```

The security rule in `firestore.rules` allows read, create, update, and delete only when the signed-in Firebase user matches the `{userId}` segment in the document path.

This means:

- A user can only access their own trips.
- A user cannot read or write trips for another Firebase UID.
- Global reads and writes are denied by the catch-all rule.
- The app must always query trips through `users/{userId}/trips`, never a top-level `trips` collection.

Deploy these rules manually in Firebase Console or with the Firebase CLI after confirming the target Firebase project.
