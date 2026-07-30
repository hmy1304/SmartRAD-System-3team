import DashboardSidebar from "@/component/dashboard/DashboardSidebar/DashboardSidebar";
import DashboardHeader from "@/component/dashboard/DashboardHeader/DashboardHeader";
import AuthGuard from "@/component/layout/AuthGuard/AuthGuard";
import styles from "./layout.module.scss";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthGuard>
      <div className={styles.dashboard}>
        <DashboardSidebar />
        <div className={styles.pageArea}>
          <DashboardHeader />
          <main className={styles.mainContent}>
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
