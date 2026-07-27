"use client";

import { useState } from "react";
import Link from "next/link";
import BrandLogo from "@/component/common/BrandLogo/BrandLogo";
import { navItems } from "@/data/landingData";
import styles from "./Header.module.scss";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <BrandLogo />

        <button
          type="button"
          className={`${styles.menuButton} ${isOpen ? styles.active : ""}`}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="메뉴 열기"
          aria-expanded={isOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`${styles.menuArea} ${isOpen ? styles.open : ""}`}>
          <nav className={styles.nav} aria-label="주요 메뉴">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} onClick={closeMenu}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className={styles.actions}>
            <Link
              href="/login"
              className={styles.primaryAction}
              onClick={closeMenu}
            >
              로그인
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
