import DashboardSidebar from "@/component/dashboard/DashboardSidebar/DashboardSidebar";
import DashboardHeader from "@/component/dashboard/DashboardHeader/DashboardHeader";
import styles from "./layout.module.scss";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className={styles.dashboard}>
      <DashboardSidebar />
      <div className={styles.pageArea}>
        <DashboardHeader />
        {children}
      </div>
    </div>
  );
}
