"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./ConfirmDialog.module.scss";

type DialogVariant = "danger" | "warning" | "default";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string | ReactNode;
  variant?: DialogVariant;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const variantIcons: Record<DialogVariant, ReactNode> = {
  danger: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  default: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  ),
};

export default function ConfirmDialog({
  open,
  title,
  message,
  variant = "default",
  confirmText = "확인",
  cancelText = "취소",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  useEffect(() => {
    if (open && dialogRef.current) {
      const focusable = dialogRef.current.querySelector<HTMLElement>("button");
      focusable?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className={styles.dialog} ref={dialogRef} onClick={(e) => e.stopPropagation()}>
        <div className={`${styles.iconWrap} ${styles[variant]}`}>
          {variantIcons[variant]}
        </div>
        <h3 id="confirm-title" className={styles.title}>{title}</h3>
        <div className={styles.message}>{message}</div>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`${styles.confirmBtn} ${styles[`confirm_${variant}`]}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
