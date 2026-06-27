"use client";

import Image from "next/image";
import {
  ArrowDown,
  CalendarDays,
  Languages,
  MapPin,
  PlaneTakeoff,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import styles from "./TripPlanner.module.scss";

const languageOptions = [
  { labelKey: "vietnamese", locale: "vi" },
  { labelKey: "english", locale: "en" },
] as const;

export function HeroSection() {
  const locale = useLocale();
  const pathname = usePathname();
  const common = useTranslations("Common");
  const hero = useTranslations("Hero");

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <Image
        className={styles.heroImage}
        src="/vietnam-hero.png"
        alt={hero("imageAlt")}
        fill
        sizes="100vw"
        priority
      />
      <div className={styles.heroOverlay} />

      <nav className={styles.nav} aria-label={common("navLabel")}>
        <Link className={styles.brand} href="/" aria-label={common("homeAria")}>
          <span className={styles.brandMark}>
            <PlaneTakeoff size={18} aria-hidden="true" />
          </span>
          {common("brand")}
        </Link>
        <div className={styles.navControls}>
          <a className={styles.navAction} href="#trip-planner">
            {hero("navAction")}
          </a>
          <div className={styles.languageSwitcher} aria-label={common("languageLabel")}>
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
        </div>
      </nav>

      <div className={styles.heroContent}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>
            <Sparkles size={16} aria-hidden="true" />
            {hero("eyebrow")}
          </span>
          <h1 id="hero-title">{hero("title")}</h1>
          <p>{hero("subtitle")}</p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="#trip-planner">
              <span>{hero("cta")}</span>
              <ArrowDown size={18} aria-hidden="true" />
            </a>
            <div className={styles.trustLine}>
              <span>{common("tripSnapshot")}</span>
              <span aria-hidden="true">·</span>
              <span>{common("noSignup")}</span>
            </div>
          </div>
        </div>

        <div className={styles.heroPreview} aria-label={hero("previewAria")}>
          <div className={styles.previewHeader}>
            <span>{hero("previewTitle")}</span>
            <strong>{hero("previewDays")}</strong>
          </div>
          <div className={styles.previewGrid}>
            <span>
              <MapPin size={17} aria-hidden="true" />
              Mỹ Khê
            </span>
            <span>
              <CalendarDays size={17} aria-hidden="true" />
              Golden Bridge
            </span>
            <span>
              <WalletCards size={17} aria-hidden="true" />
              {hero("previewBudget")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

