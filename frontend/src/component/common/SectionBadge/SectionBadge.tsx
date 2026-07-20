import styles from "./SectionBadge.module.scss";

interface SectionBadgeProps {
  children: React.ReactNode;
}

export default function SectionBadge({ children }: SectionBadgeProps) {
  return <span className={styles.badge}>●&nbsp; {children}</span>;
}
