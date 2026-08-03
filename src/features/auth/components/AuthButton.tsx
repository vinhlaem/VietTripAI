"use client";

import { LogIn, LogOut, UserCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import styles from "./Auth.module.scss";

function getUserLabel(
  displayName: string | null,
  email: string | null,
  fallback: string,
) {
  return displayName || email || fallback;
}

export function AuthButton() {
  const auth = useTranslations("Auth");
  const common = useTranslations("Common");
  const { isAuthenticated, isLoading, signInWithGoogle, signOut, user } =
    useAuth();
  const [isBusy, setIsBusy] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isAccountOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsAccountOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAccountOpen]);

  async function handleSignIn() {
    setIsBusy(true);

    try {
      await signInWithGoogle();
    } catch {
      // Keep auth failures local until a dedicated notification surface exists.
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSignOut() {
    setIsBusy(true);

    try {
      await signOut();
      setIsAccountOpen(false);
    } catch {
      // Keep auth failures local until a dedicated notification surface exists.
    } finally {
      setIsBusy(false);
    }
  }

  if (isLoading) {
    return (
      <button
        className={`${styles.authButton} ${styles.loadingButton}`}
        type="button"
        disabled
      >
        <span className={styles.loadingDot} aria-hidden="true" />
        <span>{auth("loading")}</span>
      </button>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <button
        className={styles.authButton}
        type="button"
        onClick={handleSignIn}
        disabled={isBusy}
      >
        <LogIn size={16} aria-hidden="true" />
        <span>{auth("signIn")}</span>
      </button>
    );
  }

  const userLabel = getUserLabel(user.displayName, user.email, common("brand"));

  return (
    <div className={styles.accountMenu} ref={accountMenuRef}>
      <button
        className={styles.avatarButton}
        type="button"
        onClick={() => setIsAccountOpen((currentValue) => !currentValue)}
        aria-expanded={isAccountOpen}
        aria-label={`${auth("signedInAs")} ${userLabel}`}
      >
        <span
          className={styles.avatar}
          style={
            user.photoURL
              ? { backgroundImage: `url(${user.photoURL})` }
              : undefined
          }
          aria-hidden="true"
        >
          {!user.photoURL
            ? userLabel.charAt(0).toUpperCase() || <UserCircle size={19} />
            : null}
        </span>
      </button>

      {isAccountOpen ? (
        <div className={styles.accountPopover} role="menu">
          <div className={styles.popoverIdentity}>
            <small>{auth("signedInAs")}</small>
            <strong>{userLabel}</strong>
          </div>
          <button
            className={styles.popoverSignOutButton}
            type="button"
            onClick={handleSignOut}
            disabled={isBusy}
            role="menuitem"
          >
            <LogOut size={15} aria-hidden="true" />
            <span>{auth("signOut")}</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
