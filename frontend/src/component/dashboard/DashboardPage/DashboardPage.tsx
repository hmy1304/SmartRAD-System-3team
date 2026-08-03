"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import type { DashboardData } from "@/types/dashboard";
import styles from "./DashboardPage.module.scss";
import { getDashboardData } from "@/services/dashboardService";

import NoticeCreateModal from "./NoticeCreateModal";
import NoticeDetailModal, {
  type NoticeDetailFallback,
} from "./NoticeDetailModal";
import NoticeEditModal from "./NoticeEditModal";
import AttendanceCheckCard from "./AttendanceCheckCard";
import {
  getNotices,
  type NoticeResponse,
  type NoticeSummary,
} from "@/services/noticeService";

interface DashboardPageProps {
  initialData: DashboardData;
}

const ADMIN_ROLES = ["최고관리자", "시스템관리자", "관리자"];

const QUICK_ACTIONS = [
  { href: "/dashboard/employees", label: "사원 등록", icon: "user-plus" as const },
  { href: "/dashboard/attendance-link", label: "근태 관리", icon: "clock" as const },
  { href: "/dashboard/payroll/info", label: "급여 관리", icon: "wallet" as const },
  { href: "/dashboard/drafts", label: "문서 관리", icon: "file" as const },
];

function QuickIcon({ name }: { name: (typeof QUICK_ACTIONS)[number]["icon"] }) {
  if (name === "user-plus") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    );
  }
  if (name === "clock") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    );
  }
  if (name === "wallet") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="6" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function resolveIsAdmin(): boolean {
  try {
    const raw = localStorage.getItem("userProfile");
    if (!raw) return false;
    const p = JSON.parse(raw) as { roleGroupName?: string };
    const role = p.roleGroupName ?? "";
    return ADMIN_ROLES.some((r) => role.includes(r));
  } catch {
    return false;
  }
}

export default function DashboardPage({ initialData }: DashboardPageProps) {
  const [todayText, setTodayText] = useState("");
  const [displayName, setDisplayName] = useState(initialData.profile.name);
  const [isAdmin, setIsAdmin] = useState(false);

  const [data, setData] = useState(initialData);
  const { userProfile } = useAuthStore();
  const canEdit = useMemo(() => {
    const perm = userProfile?.perms?.find(p => p.menuCode === 'NOTICE');
    return perm ? perm.canWrite : false;
  }, [userProfile]);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [detailFallback, setDetailFallback] =
    useState<NoticeDetailFallback | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editNotice, setEditNotice] = useState<NoticeResponse | null>(null);
  const [noticeList, setNoticeList] = useState<NoticeSummary[]>([]);

  const {
    summaryCards,
    approvalItems,
    attendanceList,
    myApprovals,
    approvalCounts,
  } = data;

  const reloadNotices = async () => {
    try {
      const page = await getNotices(10);
      setNoticeList(page.content ?? []);
    } catch {
      setNoticeList([]);
    }
  };

  useEffect(() => {
    const now = new Date();
    const week = ["일", "월", "화", "수", "목", "금", "토"][now.getDay()];
    setTodayText(
      `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${week}요일`,
    );

    setIsAdmin(resolveIsAdmin());

    try {
      const raw = localStorage.getItem("userProfile");
      if (raw) {
        const p = JSON.parse(raw) as { name?: string };
        if (p?.name) setDisplayName(p.name);
      }
    } catch {
      /* ignore */
    }

    getDashboardData()
      .then(setData)
      .catch(() => {
        /* initialData 유지 */
      });

    reloadNotices();
  }, []);

  const chartPoints = useMemo(() => {
    const ys = [120, 110, 95, 100, 85, 90, 70, 75, 60, 55, 50, 58];
    return ys.map((y, i) => `${40 + i * 52},${20 + y * 0.9}`).join(" ");
  }, []);

  const displayNotices =
    noticeList.length > 0
      ? noticeList.map((n) => ({
          id: Number(n.id),
          title: n.title,
          dateText: n.createdAt
            ? String(n.createdAt).slice(0, 10).replaceAll("-", ".")
            : "",
          fromApi: true as const,
        }))
      : [];

  const openDetail = (item: (typeof displayNotices)[number]) => {
    setDetailId(item.id);
    if (item.fromApi) {
      setDetailFallback(null);
    } else {
      setDetailFallback({
        id: item.id,
        title: item.title,
        content: "이 공지는 미리보기 데이터입니다.",
        dateText: item.dateText,
        authorName: "관리자",
        noticeTypeName: "일반공지",
      });
    }
    setDetailOpen(true);
  };

  const visibleSummaryCards = summaryCards.filter((card) => {
    if (isAdmin) return true;
    if (card.label === "금일 출근" || card.label === "결재 대기") return false;
    return true;
  });

  const visibleQuickActions = isAdmin
    ? QUICK_ACTIONS
    : QUICK_ACTIONS.filter((q) => q.label !== "사원 등록");

  return (
    <div className={styles.dashboardHome}>
      <section className={styles.welcome}>
        <div>
          <h1>
            좋은 아침입니다, {displayName}님 <span aria-hidden>👋</span>
          </h1>
          <p>
            오늘도 원내 인사 현황을 빠르게 확인하고, 처리가 필요한 업무를
            챙겨보세요.
          </p>
        </div>
        <div className={styles.today}>
          <small>오늘</small>
          <strong>{todayText || "…"}</strong>
        </div>
      </section>

      <AttendanceCheckCard />

      {isAdmin && (data.urgentStatutory ?? 0) > 0 && (
        <div style={{
          backgroundColor: "#fff0f0",
          color: "#d32f2f",
          padding: "1rem 1.5rem",
          borderRadius: "8px",
          marginBottom: "1.5rem",
          border: "1px solid #ffcdd2",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          fontWeight: 600
        }}>
          <span style={{ fontSize: "1.2rem" }}>⚠️</span>
          <span>
            현재 기한이 임박한 법정 의무 교육 미이수자가 <strong>{data.urgentStatutory}명</strong> 있습니다. 과태료가 발생하지 않도록 확인해 주세요.
          </span>
          <Link 
            href="/dashboard/statutory" 
            style={{ marginLeft: "auto", textDecoration: "underline", color: "#d32f2f" }}
          >
            상세 보기
          </Link>
        </div>
      )}

      <section
        className={styles.summaryGrid}
        style={!isAdmin ? { gridTemplateColumns: "repeat(2, 1fr)" } : undefined}
      >
        {visibleSummaryCards.map((card) => (
          <article key={card.label} className={styles.summaryCard}>
            <div className={styles.summaryTop}>
              <span className={styles.summaryIcon}>
                {card.icon === "people" && "👥"}
                {card.icon === "check" && "✓"}
                {card.icon === "calendar" && "📅"}
                {card.icon === "document" && "📄"}
              </span>
              <em className={styles[card.statusType]}>{card.status}</em>
            </div>
            <p>{card.label}</p>
            <h2>
              {card.value}
              <small>{card.unit}</small>
            </h2>
          </article>
        ))}
      </section>

      {isAdmin && (
        <section className={styles.middleGrid}>
          <article className={styles.panel}>
            <div className={styles.panelTitle}>
              <h2>월별 근태 현황</h2>
              <span className={styles.legend}>
                <i className={styles.dotBlue} /> 정상 출근율
              </span>
            </div>
            <div className={styles.lineChart}>
              <svg viewBox="0 0 700 190" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3a7bff" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3a7bff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polyline
                  fill="url(#areaFill)"
                  stroke="none"
                  points={`40,180 ${chartPoints} 664,180`}
                />
                <polyline
                  fill="none"
                  stroke="#3a7bff"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  points={chartPoints}
                />
              </svg>
            </div>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelTitle}>
              <h2>결재 대기 안건</h2>
              <Link href="/dashboard/approvals" className={styles.linkBtn}>
                전체보기 ›
              </Link>
            </div>
            <ul className={styles.approvalList}>
              {approvalItems.length === 0 ? (
                <li className={styles.emptyNotice}>대기 안건이 없습니다</li>
              ) : (
                approvalItems.map((item) => (
                  <li key={item.id}>
                    <span className={`${styles.dot} ${styles[item.color]}`} />
                    <p>{item.text}</p>
                    <em className={styles.itemBadge}>{item.badge}</em>
                  </li>
                ))
              )}
            </ul>
          </article>
        </section>
      )}

      <section
        className={styles.bottomGrid}
        style={!isAdmin ? { gridTemplateColumns: "1fr 1fr 1fr" } : undefined}
      >
        {isAdmin && (
          <article className={styles.panel}>
            <div className={styles.panelTitle}>
              <h2>오늘의 근무 현황</h2>
              <Link href="/dashboard/attendance" className={styles.linkBtn}>
                전체보기 ›
              </Link>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.attTable}>
                <thead>
                  <tr>
                    <th>이름</th>
                    <th>부서</th>
                    <th>출근</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceList.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        style={{ textAlign: "center", color: "#a0aec0" }}
                      >
                        근무 현황이 없습니다
                      </td>
                    </tr>
                  ) : (
                    attendanceList.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <div className={styles.person}>
                            <span className={styles.avatar}>
                              {row.name.charAt(0)}
                            </span>
                            {row.name}
                          </div>
                        </td>
                        <td>{row.dept}</td>
                        <td>{row.time}</td>
                        <td>
                          <em
                            className={`${styles.status} ${styles[row.statusType]}`}
                          >
                            {row.status}
                          </em>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>
        )}

        <article className={styles.panel}>
          <div className={styles.panelTitle}>
            <h2>공지사항</h2>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => setCreateOpen(true)}
              disabled={!canEdit}
              title={!canEdit ? "수정 권한이 없습니다" : undefined}
              style={{ opacity: canEdit ? 1 : 0.4, cursor: canEdit ? 'pointer' : 'not-allowed' }}
            >
              공지사항 작성 ›
            </button>
          </div>
          <ul className={styles.noticeList}>
            {displayNotices.length === 0 ? (
              <li className={styles.emptyNotice}>공지사항이 없습니다</li>
            ) : (
              displayNotices.map((n) => (
                <li key={n.id} className={styles.noticeItem}>
                  <button
                    type="button"
                    className={styles.noticeItemBtn}
                    onClick={() => openDetail(n)}
                  >
                    <strong className={styles.noticeTitle}>{n.title}</strong>
                    <time className={styles.noticeDate}>{n.dateText}</time>
                  </button>
                </li>
              ))
            )}
          </ul>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelTitle}>
            <h2>빠른 업무</h2>
          </div>
          <div className={styles.quickGrid}>
            {visibleQuickActions.map((q) => (
              <Link key={q.href} href={q.href} className={styles.quickItem}>
                <span className={styles.quickIcon}>
                  <QuickIcon name={q.icon} />
                </span>
                <span>{q.label}</span>
              </Link>
            ))}
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelTitle}>
            <h2>나의 결재함</h2>
            <Link href="/dashboard/drafts" className={styles.linkBtn}>
              전체보기 ›
            </Link>
          </div>
          <div className={styles.approvalStats}>
            <span className={styles.statWait}>
              ● 대기 {approvalCounts.waiting}
            </span>
            <span className={styles.statOk}>
              ● 승인 {approvalCounts.approved}
            </span>
            <span className={styles.statNo}>
              ● 반려 {approvalCounts.rejected}
            </span>
          </div>
          <ul className={styles.myApprovalList}>
            {myApprovals.length === 0 ? (
              <li className={styles.emptyNotice}>결재 문서가 없습니다</li>
            ) : (
              myApprovals.map((item) => (
                <li key={item.id}>
                  <div>
                    <strong>{item.title}</strong>
                    <small>
                      {item.author} · {item.date}
                    </small>
                  </div>
                  <em className={`${styles.status} ${styles[item.statusType]}`}>
                    {item.status}
                  </em>
                </li>
              ))
            )}
          </ul>
        </article>
      </section>

      {isAdmin && (
        <NoticeCreateModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={reloadNotices}
        />
      )}

      <NoticeDetailModal
      open={detailOpen}
      noticeId={detailId}
      fallback={detailFallback}
      canManage={isAdmin}
      onClose={() => {
        setDetailOpen(false);
        setDetailFallback(null);
      }}
      onEdit={(n) => {
        if (!isAdmin) return;
        setDetailOpen(false);
        setEditNotice(n);
        setEditOpen(true);
      }}
      onDeleted={reloadNotices}
    />

      {isAdmin && (
        <NoticeEditModal
          open={editOpen}
          notice={editNotice}
          onClose={() => setEditOpen(false)}
          onUpdated={reloadNotices}
        />
      )}
    </div>
  );
}