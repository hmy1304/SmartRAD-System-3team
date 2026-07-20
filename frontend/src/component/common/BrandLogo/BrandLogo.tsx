import styles from "./BrandLogo.module.scss";
import Link from "next/link";

interface BrandLogoProps {
  inverse?: boolean;
  href?: string;
}

export default function BrandLogo({
  inverse = false,
  href = "/",
}: BrandLogoProps) {
  return (
    <Link
      href={href}
      className={`${styles.brand} ${inverse ? styles.inverse : ""}`}
    >
      <span className={styles.symbol} aria-hidden="true">
        <span />
        <span />
      </span>

      <span className={styles.name}>SmartRAD HR</span>
    </Link>
  );
}
