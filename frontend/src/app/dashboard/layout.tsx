"use client";

import { useState } from "react";
import DashboardSidebar from "@/component/dashboard/DashboardSidebar/DashboardSidebar";
import DashboardHeader from "@/component/dashboard/DashboardHeader/DashboardHeader";
import AuthGuard from "@/component/layout/AuthGuard/AuthGuard";
import styles from "./layout.module.scss";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <div className={styles.dashboard}>
        <DashboardSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className={styles.pageArea}>
          <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
          <main className={styles.mainContent}>
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
