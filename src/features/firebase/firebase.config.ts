import type { FirebaseClientConfig, FirebaseEnvKey } from "./types";

const firebaseEnvMap = [
  ["apiKey", "NEXT_PUBLIC_FIREBASE_API_KEY"],
  ["authDomain", "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"],
  ["projectId", "NEXT_PUBLIC_FIREBASE_PROJECT_ID"],
  ["storageBucket", "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"],
  ["messagingSenderId", "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"],
  ["appId", "NEXT_PUBLIC_FIREBASE_APP_ID"],
] as const satisfies readonly [keyof FirebaseClientConfig, FirebaseEnvKey][];

function readFirebaseConfig(): FirebaseClientConfig {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  };
}

export function getMissingFirebaseConfigKeys() {
  const config = readFirebaseConfig();

  return firebaseEnvMap
    .filter(([configKey]) => !config[configKey].trim())
    .map(([, envKey]) => envKey);
}

export function hasFirebaseConfig() {
  return getMissingFirebaseConfigKeys().length === 0;
}

export function getFirebaseConfig() {
  const missingKeys = getMissingFirebaseConfigKeys();

  if (missingKeys.length > 0) {
    throw new Error(
      `Firebase config is missing required environment variables: ${missingKeys.join(", ")}`,
    );
  }

  return readFirebaseConfig();
}
