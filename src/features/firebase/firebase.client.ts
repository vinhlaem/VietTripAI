"use client";

import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getFirebaseConfig } from "./firebase.config";

function assertClientRuntime() {
  if (typeof window === "undefined") {
    throw new Error("Firebase client SDK can only be initialized in the browser.");
  }
}

export function getFirebaseClientApp(): FirebaseApp {
  assertClientRuntime();

  const existingApp = getApps()[0];

  if (existingApp) {
    return existingApp;
  }

  return initializeApp(getFirebaseConfig());
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseClientApp());
}

export function getFirebaseDb(): Firestore {
  return getFirestore(getFirebaseClientApp());
}

