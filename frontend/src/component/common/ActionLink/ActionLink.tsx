import styles from "./ActionLink.module.scss";

interface ActionLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  full?: boolean;
}

export default function ActionLink({
  href,
  children,
  variant = "primary",
  full = false,
}: ActionLinkProps) {
  return (
    <a
      className={`${styles.link} ${styles[variant]} ${full ? styles.full : ""}`}
      href={href}
    >
      {children}
    </a>
  );
}
