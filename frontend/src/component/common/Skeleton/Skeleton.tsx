"use client";

import styles from "./Skeleton.module.scss";

interface SkeletonProps {
  variant?: "text" | "circle" | "rect" | "card";
  width?: string | number;
  height?: string | number;
  count?: number;
  className?: string;
}

function SingleSkeleton({ variant = "text", width, height, className }: Omit<SkeletonProps, "count">) {
  if (variant === "card") {
    return (
      <div className={`${styles.card} ${className || ""}`}>
        <div className={styles.shimmer} style={{ width: "60%", height: 14, borderRadius: 7 }} />
        <div className={styles.shimmer} style={{ width: "100%", height: 12, borderRadius: 6, marginTop: 12 }} />
        <div className={styles.shimmer} style={{ width: "85%", height: 12, borderRadius: 6, marginTop: 8 }} />
        <div className={styles.shimmer} style={{ width: "70%", height: 12, borderRadius: 6, marginTop: 8 }} />
      </div>
    );
  }

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  const variantClass = variant === "circle" ? styles.circle : variant === "rect" ? styles.rect : styles.text;

  return <div className={`${styles.shimmer} ${variantClass} ${className || ""}`} style={style} />;
}

export default function Skeleton({ count = 1, ...props }: SkeletonProps) {
  if (count <= 1) return <SingleSkeleton {...props} />;
  return (
    <div className={styles.stack}>
      {Array.from({ length: count }, (_, i) => (
        <SingleSkeleton key={i} {...props} />
      ))}
    </div>
  );
}
