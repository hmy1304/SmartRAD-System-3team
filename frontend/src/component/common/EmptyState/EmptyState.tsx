"use client";

import styles from "./EmptyState.module.scss";

type IconType = "search" | "data" | "document" | "error";

interface EmptyStateProps {
  icon?: IconType;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const illustrations: Record<IconType, React.ReactNode> = {
  search: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="52" cy="52" r="30" stroke="#c8d4e5" strokeWidth="3" />
      <line x1="73" y1="73" x2="98" y2="98" stroke="#c8d4e5" strokeWidth="4" strokeLinecap="round" />
      <circle cx="52" cy="52" r="12" stroke="#dce3ee" strokeWidth="2" strokeDasharray="4 4" />
    </svg>
  ),
  data: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="70" width="16" height="30" rx="4" fill="#dce3ee" />
      <rect x="44" y="50" width="16" height="50" rx="4" fill="#c8d4e5" />
      <rect x="68" y="35" width="16" height="65" rx="4" fill="#dce3ee" />
      <path d="M28 65 L52 42 L76 30 L96 18" stroke="#b0bdd0" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" />
    </svg>
  ),
  document: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="15" width="60" height="80" rx="6" stroke="#c8d4e5" strokeWidth="2.5" />
      <path d="M30 15h40l20 20v60a6 6 0 0 1-6 6H36a6 6 0 0 1-6-6V15Z" stroke="#c8d4e5" strokeWidth="2.5" />
      <path d="M70 15v20h20" stroke="#c8d4e5" strokeWidth="2.5" />
      <line x1="45" y1="50" x2="75" y2="50" stroke="#dce3ee" strokeWidth="2" strokeLinecap="round" />
      <line x1="45" y1="60" x2="68" y2="60" stroke="#dce3ee" strokeWidth="2" strokeLinecap="round" />
      <line x1="45" y1="70" x2="60" y2="70" stroke="#dce3ee" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="35" stroke="#c8d4e5" strokeWidth="3" />
      <path d="M60 42v24" stroke="#b0bdd0" strokeWidth="3" strokeLinecap="round" />
      <circle cx="60" cy="78" r="2.5" fill="#b0bdd0" />
    </svg>
  ),
};

export default function EmptyState({ icon = "data", title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className={styles.container}>
      <div className={styles.illustration}>{illustrations[icon]}</div>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {actionLabel && onAction && (
        <button className={styles.action} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
