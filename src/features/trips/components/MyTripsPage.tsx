"use client";

import {
  CalendarDays,
  Languages,
  LockKeyhole,
  LogIn,
  LogOut,
  PlaneTakeoff,
  RefreshCw,
  Sparkles,
  UserCircle,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { AuthButton } from "@/features/auth/components/AuthButton";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Link, usePathname } from "@/i18n/navigation";
import { useUserTrips } from "../hooks/useUserTrips";
import { TripCard } from "./TripCard";
import { TripsEmptyState } from "./TripsEmptyState";
import { TripsLoadingState } from "./TripsLoadingState";
import styles from "./MyTrips.module.scss";

const languageOptions = [
  { labelKey: "vietnamese", locale: "vi" },
  { labelKey: "english", locale: "en" },
] as const;

function getUserLabel(
  displayName: string | null,
  email: string | null,
  fallback: string,
) {
  return displayName || email || fallback;
}

export function MyTripsPage() {
  const locale = useLocale();
  const pathname = usePathname();
  const common = useTranslations("Common");
  const hero = useTranslations("Hero");
  const tripsText = useTranslations("Trips");
  const auth = useTranslations("Auth");
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    signInWithGoogle,
    signOut,
    user,
  } = useAuth();
  const { trips, isLoading, isError, refetch } = useUserTrips();
  const [isAuthBusy, setIsAuthBusy] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const userLabel = getUserLabel(
    user?.displayName ?? null,
    user?.email ?? null,
    common("brand"),
  );

  useEffect(() => {
    if (!isDrawerOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDrawerOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen]);

  async function handleSignIn() {
    setIsAuthBusy(true);

    try {
      await signInWithGoogle();
    } catch {
      // Keep auth failures local until a dedicated notification surface exists.
    } finally {
      setIsAuthBusy(false);
    }
  }

  async function handleSignOut() {
    setIsAuthBusy(true);

    try {
      await signOut();
      setIsDrawerOpen(false);
    } catch {
      // Keep auth failures local until a dedicated notification surface exists.
    } finally {
      setIsAuthBusy(false);
    }
  }

  let content;

  if (isAuthLoading || isLoading) {
    content = <TripsLoadingState />;
  } else if (!isAuthenticated) {
    content = (
      <section
        className={styles.signInState}
        aria-labelledby="my-trips-sign-in-title"
      >
        <span className={styles.stateIcon} aria-hidden="true">
          <LockKeyhole size={26} />
        </span>
        <div>
          <h2 id="my-trips-sign-in-title">{tripsText("myTripsTitle")}</h2>
          <p>{tripsText("signInToViewTrips")}</p>
        </div>
        <button
          className={styles.primaryAction}
          type="button"
          onClick={handleSignIn}
          disabled={isAuthBusy}
        >
          {auth("signIn")}
        </button>
      </section>
    );
  } else if (isError) {
    content = (
      <section
        className={styles.signInState}
        aria-labelledby="my-trips-error-title"
      >
        <span className={styles.stateIcon} aria-hidden="true">
          <RefreshCw size={26} />
        </span>
        <div>
          <h2 id="my-trips-error-title">{tripsText("loadErrorTitle")}</h2>
          <p>{tripsText("loadErrorDescription")}</p>
        </div>
        <button
          className={styles.primaryAction}
          type="button"
          onClick={refetch}
        >
          {tripsText("tryAgain")}
        </button>
      </section>
    );
  } else if (trips.length === 0) {
    content = <TripsEmptyState />;
  } else {
    content = (
      <section
        className={styles.tripGrid}
        aria-label={tripsText("myTripsTitle")}
      >
        {trips.map((trip) => (
          <TripCard trip={trip} key={trip.id} />
        ))}
      </section>
    );
  }

  return (
    <main className={styles.myTripsPage}>
      <header className={styles.topNav}>
        <Link className={styles.brand} href="/" aria-label={common("homeAria")}>
          <span className={styles.brandMark}>
            <PlaneTakeoff size={18} aria-hidden="true" />
          </span>
          {common("brand")}
        </Link>

        <nav className={styles.navControls} aria-label={common("navLabel")}>
          <Link
            className={`${styles.navLink} ${styles.navLinkActive}`}
            href="/my-trips"
            aria-current="page"
          >
            <CalendarDays size={16} aria-hidden="true" />
            {tripsText("myTrips")}
          </Link>
          <Link className={styles.navLink} href="/">
            {hero("navAction")}
          </Link>
          <div
            className={styles.languageSwitcher}
            aria-label={common("languageLabel")}
          >
            <span className={styles.languageIcon} aria-hidden="true">
              <Languages size={15} />
            </span>
            {languageOptions.map((option) => (
              <Link
                className={`${styles.languageButton} ${
                  locale === option.locale ? styles.languageButtonActive : ""
                }`}
                href={pathname}
                key={option.locale}
                locale={option.locale}
                aria-current={locale === option.locale ? "true" : undefined}
              >
                {common(option.labelKey)}
              </Link>
            ))}
          </div>
          <AuthButton />
        </nav>

        <button
          className={styles.mobileMenuButton}
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          aria-label={common("openMenu")}
          aria-expanded={isDrawerOpen}
        >
          <span
            className={styles.mobileAvatar}
            style={
              user?.photoURL
                ? { backgroundImage: `url(${user.photoURL})` }
                : undefined
            }
            aria-hidden="true"
          >
            {user?.photoURL ? null : isAuthenticated && userLabel ? (
              userLabel.charAt(0).toUpperCase()
            ) : (
              <UserCircle size={21} />
            )}
          </span>
        </button>
      </header>

      {isDrawerOpen ? (
        <div className={styles.mobileDrawerOverlay}>
          <button
            className={styles.mobileDrawerBackdrop}
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            aria-label={common("closeMenu")}
          />
          <aside
            className={styles.mobileDrawer}
            aria-label={common("navLabel")}
          >
            <div className={styles.mobileDrawerHeader}>
              <Link
                className={styles.drawerBrand}
                href="/"
                onClick={() => setIsDrawerOpen(false)}
              >
                <span className={styles.brandMark}>
                  <PlaneTakeoff size={18} aria-hidden="true" />
                </span>
                {common("brand")}
              </Link>
              <button
                className={styles.drawerCloseButton}
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                aria-label={common("closeMenu")}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className={styles.drawerNavList}>
              <Link
                className={styles.drawerNavLink}
                href="/my-trips"
                onClick={() => setIsDrawerOpen(false)}
              >
                <CalendarDays size={17} aria-hidden="true" />
                {tripsText("myTrips")}
              </Link>
              <Link
                className={styles.drawerNavLink}
                href="/"
                onClick={() => setIsDrawerOpen(false)}
              >
                <Sparkles size={17} aria-hidden="true" />
                {hero("navAction")}
              </Link>
            </div>

            <div className={styles.drawerSection}>
              <span className={styles.drawerSectionLabel}>
                {common("languageLabel")}
              </span>
              <div
                className={`${styles.languageSwitcher} ${styles.drawerLanguageSwitcher}`}
                aria-label={common("languageLabel")}
              >
                <span className={styles.languageIcon} aria-hidden="true">
                  <Languages size={15} />
                </span>
                {languageOptions.map((option) => (
                  <Link
                    className={`${styles.languageButton} ${
                      locale === option.locale
                        ? styles.languageButtonActive
                        : ""
                    }`}
                    href={pathname}
                    key={option.locale}
                    locale={option.locale}
                    aria-current={locale === option.locale ? "true" : undefined}
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    {common(option.labelKey)}
                  </Link>
                ))}
              </div>
            </div>

            <div className={styles.drawerSection}>
              <span className={styles.drawerSectionLabel}>
                {isAuthenticated ? auth("signedInAs") : auth("signIn")}
              </span>
              {isAuthLoading ? (
                <button
                  className={styles.drawerAuthButton}
                  type="button"
                  disabled
                >
                  <span
                    className={styles.drawerLoadingDot}
                    aria-hidden="true"
                  />
                  {auth("loading")}
                </button>
              ) : isAuthenticated && user ? (
                <div className={styles.drawerAccountCard}>
                  <span
                    className={styles.drawerAvatar}
                    style={
                      user.photoURL
                        ? { backgroundImage: `url(${user.photoURL})` }
                        : undefined
                    }
                    aria-hidden="true"
                  >
                    {user.photoURL ? null : userLabel.charAt(0).toUpperCase()}
                  </span>
                  <span className={styles.drawerIdentity}>
                    <small>{auth("signedInAs")}</small>
                    <strong>{userLabel}</strong>
                  </span>
                  <button
                    className={styles.drawerSignOutButton}
                    type="button"
                    onClick={handleSignOut}
                    disabled={isAuthBusy}
                  >
                    <LogOut size={15} aria-hidden="true" />
                    {auth("signOut")}
                  </button>
                </div>
              ) : (
                <button
                  className={styles.drawerAuthButton}
                  type="button"
                  onClick={handleSignIn}
                  disabled={isAuthBusy}
                >
                  <LogIn size={16} aria-hidden="true" />
                  {auth("signIn")}
                </button>
              )}
            </div>
          </aside>
        </div>
      ) : null}

      <section className={styles.heroPanel}>
        <span>{tripsText("myTrips")}</span>
        <h1>{tripsText("myTripsTitle")}</h1>
        <p>{tripsText("myTripsSubtitle")}</p>
      </section>

      {content}
    </main>
  );
}
