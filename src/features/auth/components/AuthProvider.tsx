/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  signInWithGoogle as signInWithGoogleClient,
  signOutUser,
  subscribeToAuthState,
} from "../api/auth.client";
import type { AuthState, AuthUser } from "../types";

const AuthContext = createContext<AuthState | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    try {
      const unsubscribe = subscribeToAuthState((nextUser) => {
        if (!isMounted) {
          return;
        }

        setUser(nextUser);
        setIsLoading(false);
      });

      return () => {
        isMounted = false;
        unsubscribe();
      };
    } catch {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const nextUser = await signInWithGoogleClient();
    setUser(nextUser);

    return nextUser;
  }, []);

  const signOut = useCallback(async () => {
    await signOutUser();
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      signInWithGoogle,
      signOut,
    }),
    [isLoading, signInWithGoogle, signOut, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
