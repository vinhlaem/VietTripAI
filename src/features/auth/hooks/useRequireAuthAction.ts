"use client";

import { useCallback, useRef, useState } from "react";
import type { AuthPromptModalProps } from "../components/AuthPromptModal";
import { useAuth } from "./useAuth";
import type { AuthUser } from "../types";

type AuthenticatedAction<Result> = (user: AuthUser) => Promise<Result> | Result;

type PendingAction = AuthenticatedAction<unknown>;

export function useRequireAuthAction() {
  const { isAuthenticated, isLoading, signInWithGoogle, user } = useAuth();
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const pendingActionRef = useRef<PendingAction | null>(null);

  const closeAuthPrompt = useCallback(() => {
    pendingActionRef.current = null;
    setIsPromptOpen(false);
  }, []);

  const runWithAuth = useCallback(
    async <Result,>(action: AuthenticatedAction<Result>): Promise<Result | null> => {
      if (isAuthenticated && user) {
        return action(user);
      }

      pendingActionRef.current = action as PendingAction;
      setIsPromptOpen(true);

      return null;
    },
    [isAuthenticated, user],
  );

  const continueWithGoogle = useCallback(async () => {
    setIsSigningIn(true);

    try {
      const nextUser = await signInWithGoogle();
      const pendingAction = pendingActionRef.current;

      if (!nextUser) {
        return;
      }

      pendingActionRef.current = null;
      setIsPromptOpen(false);

      if (pendingAction) {
        await pendingAction(nextUser);
      }
    } catch {
      // Keep auth prompt failures local until a dedicated notification surface exists.
    } finally {
      setIsSigningIn(false);
    }
  }, [signInWithGoogle]);

  const authPromptModalProps: AuthPromptModalProps = {
    isLoading: isLoading || isSigningIn,
    isOpen: isPromptOpen,
    onClose: closeAuthPrompt,
    onContinueWithGoogle: continueWithGoogle,
  };

  return {
    authPromptModalProps,
    closeAuthPrompt,
    isAuthPromptOpen: isPromptOpen,
    runWithAuth,
  };
}

