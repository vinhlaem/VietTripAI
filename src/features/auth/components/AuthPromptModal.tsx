"use client";

import { LogIn } from "lucide-react";
import { useTranslations } from "next-intl";
import styles from "./Auth.module.scss";

export type AuthPromptModalProps = {
  isLoading?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onContinueWithGoogle: () => Promise<void> | void;
};

export function AuthPromptModal({
  isLoading = false,
  isOpen,
  onClose,
  onContinueWithGoogle,
}: AuthPromptModalProps) {
  const auth = useTranslations("Auth");

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} role="presentation">
      <section
        className={styles.authModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-prompt-title"
        aria-describedby="auth-prompt-description"
      >
        <div className={styles.modalIcon} aria-hidden="true">
          <LogIn size={19} />
        </div>
        <h2 id="auth-prompt-title">{auth("saveRequiresLoginTitle")}</h2>
        <p id="auth-prompt-description">
          {auth("saveRequiresLoginDescription")}
        </p>
        <div className={styles.modalActions}>
          <button
            className={styles.googleButton}
            type="button"
            onClick={onContinueWithGoogle}
            disabled={isLoading}
          >
            {auth("continueWithGoogle")}
          </button>
          <button
            className={styles.cancelButton}
            type="button"
            onClick={onClose}
            disabled={isLoading}
          >
            {auth("cancel")}
          </button>
        </div>
      </section>
    </div>
  );
}
