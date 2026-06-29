"use client";

import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/features/firebase/firebase.client";
import type { AuthUser } from "../types";

function normalizeAuthUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
}

export async function signInWithGoogle(): Promise<AuthUser | null> {
  try {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(getFirebaseAuth(), provider);

    return credential.user ? normalizeAuthUser(credential.user) : null;
  } catch {
    throw new Error("Unable to sign in with Google.");
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await signOut(getFirebaseAuth());
  } catch {
    throw new Error("Unable to sign out.");
  }
}

export function subscribeToAuthState(callback: (user: AuthUser | null) => void) {
  return onAuthStateChanged(getFirebaseAuth(), (user: User | null) => {
    callback(user ? normalizeAuthUser(user) : null);
  });
}


