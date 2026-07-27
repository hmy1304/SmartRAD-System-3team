"use client";

import { useMemo, useState } from "react";



import styles from "./DraftDocumentsPage.module.scss";

type TabId = "all" | "progress" | "done" | "rejected" | "draft";

type DocumentStatus = Exclude<TabId, "all">;

type DocumentKind = "personnel" | "proposal" | "plan" | "request";

type IconName = "document" | "progress" | "complete" | "rejected" | "draft";

interface SummaryCard {
  label: string;
  value: string;
  description: string;
  tone: "purple" | "blue" | "green" | "red" | "gray";
  icon: IconName;
}

interface DocumentItem {
  number: string;
  title: string;
  attachment: string;
  kindLabel: string;
  kind: DocumentKind;
  createdAt: string;
  approver: string;
  approverInitial?: string;
  statusLabel: string;
  status: DocumentStatus;
  deadline: string;
  deadlineWarning?: boolean;
  temporary?: boolean;
}

const summaryCards: SummaryCard[] = [
  {
    label: "전체 기안",
    value: "47건",
    description: "전월 대비 +5건",
    tone: "purple",
    icon: "document",
  },
  {
    label: "결재 진행중",
    value: "12건",
    description: "처리 필요 문서",
    tone: "blue",
    icon: "progress",
  },
  {
    label: "결재 완료",
    value: "29건",
    description: "승인율 80.2%",
    tone: "green",
    icon: "complete",
  },
  {
    label: "반려",
    value: "3건",
    description: "전월 대비 +1건",
    tone: "red",
    icon: "rejected",
  },
  {
    label: "임시저장",
    value: "3건",
    description: "제출 전 임시 저장",
    tone: "gray",
    icon: "draft",
  },
];

const tabs: {
  id: TabId;
  label: string;
  count: number;
}[] = [
  {
    id: "all",
    label: "전체",
    count: 47,
  },
  {
    id: "progress",
    label: "결재중",
    count: 12,
  },
  {
    id: "done",
    label: "완료",
    count: 29,
  },
  {
    id: "rejected",
    label: "반려",
    count: 3,
  },
  {
    id: "draft",
    label: "임시저장",
    count: 3,
  },
];

const documentItems: DocumentItem[] = [
  {
    number: "2025-047",
    title: "2025년 6월 인사발령 요청의 건",
    attachment: "첨부 3건",
    kindLabel: "인사발령",
    kind: "personnel",
    createdAt: "2025.06.25 09:14",
    approver: "박부장 외 2명",
    approverInitial: "박",
    statusLabel: "결재중",
    status: "progress",
    deadline: "2025.06.27",
    deadlineWarning: true,
  },
  {
    number: "2025-046",
    title: "6월 연장근로 수당 지급 품의",
    attachment: "첨부 1건",
    kindLabel: "품의서",
    kind: "proposal",
    createdAt: "2025.06.24 14:30",
    approver: "이팀장 외 1명",
    approverInitial: "이",
    statusLabel: "완료",
    status: "done",
    deadline: "2025.06.26",
  },
  {
    number: "2025-045",
    title: "신규 직원 채용 계획서 (2025 하반기)",
    attachment: "첨부 5건",
    kindLabel: "계획서",
    kind: "plan",
    createdAt: "2025.06.23 11:05",
    approver: "최원장 외 3명",
    approverInitial: "최",
    statusLabel: "결재중",
    status: "progress",
    deadline: "2025.06.30",
  },
  {
    number: "2025-044",
    title: "직원 휴직 및 복직 처리 요청",
    attachment: "첨부 2건",
    kindLabel: "인사발령",
    kind: "personnel",
    createdAt: "2025.06.20 16:45",
    approver: "박부장",
    approverInitial: "박",
    statusLabel: "반려",
    status: "rejected",
    deadline: "2025.06.22",
  },
  {
    number: "2025-043",
    title: "간호사 면허 갱신 지원비 지급 품의",
    attachment: "첨부 없음",
    kindLabel: "품의서",
    kind: "proposal",
    createdAt: "2025.06.18 10:22",
    approver: "이팀장 외 2명",
    approverInitial: "이",
    statusLabel: "완료",
    status: "done",
    deadline: "2025.06.20",
  },
  {
    number: "2025-042",
    title: "의료기기 점검 일정 조율 요청서 (임시저장)",
    attachment: "임시저장 중",
    kindLabel: "요청서",
    kind: "request",
    createdAt: "2025.06.17 (미완성)",
    approver: "-",
    statusLabel: "임시저장",
    status: "draft",
    deadline: "-",
    temporary: true,
  },
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4v10" />
      <path d="m8 10 4 4 4-4" />
      <path d="M5 19h14" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 16-1 4 4-1L18 9l-3-3Z" />
      <path d="m13.5 7.5 3 3" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 7h14" />
      <path d="M9 7V4h6v3" />
      <path d="m7 7 1 13h8l1-13" />
      <path d="M10 11v5M14 11v5" />
    </svg>
  );
}

function SummaryIcon({ name }: { name: IconName }) {
  if (name === "document") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="6" y="4" width="12" height="16" rx="2" />
        <path d="M9 2h7a2 2 0 0 1 2 2v13" />
      </svg>
    );
  }

  if (name === "progress") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 12a8 8 0 1 1-2.4-5.7" />
        <path d="M20 5v5h-5" />
      </svg>
    );
  }

  if (name === "complete") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" />
        <path d="m8.5 12 2.3 2.3 4.8-5" />
      </svg>
    );
  }

  if (name === "rejected") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" />
        <path d="m9.5 9.5 5 5M14.5 9.5l-5 5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M14 3v4h4" />
      <path d="m9 16 5-5 2 2-5 5H9z" />
    </svg>
  );
}

export default function DraftDocumentsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [keyword, setKeyword] = useState("");

  const filteredDocuments = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return documentItems.filter((document) => {
      const matchesTab = activeTab === "all" || document.status === activeTab;

      const matchesKeyword =
        normalizedKeyword.length === 0 ||
        document.number.toLowerCase().includes(normalizedKeyword) ||
        document.title.toLowerCase().includes(normalizedKeyword) ||
        document.kindLabel.toLowerCase().includes(normalizedKeyword);

      return matchesTab && matchesKeyword;
    });
  }, [activeTab, keyword]);

  return (
    <>

        <main className={styles.main}>
          <section className={styles.pageHeader}>
            <div>
              <h1>기안 문서함</h1>
              <p>내가 기안한 문서 목록을 확인하고 관리할 수 있습니다.</p>
            </div>

            <div className={styles.headerActions}>
              <button type="button" className={styles.excelButton}>
                <DownloadIcon />
                엑셀 다운로드
              </button>

              <button type="button" className={styles.newDocumentButton}>
                <PlusIcon />새 문서 기안
              </button>
            </div>
          </section>

          <section className={styles.summaryGrid}>
            {summaryCards.map((card) => (
              <article key={card.label} className={styles.summaryCard}>
                <div className={styles.summaryContent}>
                  <p>{card.label}</p>
                  <h2>{card.value}</h2>

                  <span className={styles[`${card.tone}Description`]}>
                    {card.tone === "purple" && "↗ "}
                    {card.tone === "blue" && "◷ "}
                    {card.tone === "green" && "↗ "}
                    {card.tone === "red" && "↘ "}
                    {card.tone === "gray" && "▣ "}
                    {card.description}
                  </span>
                </div>

                <span
                  className={`${styles.summaryIcon} ${
                    styles[`${card.tone}Icon`]
                  }`}
                >
                  <SummaryIcon name={card.icon} />
                </span>
              </article>
            ))}
          </section>

          <section className={styles.tableCard}>
            <div className={styles.tableTop}>
              <div className={styles.tabs} role="tablist">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    className={activeTab === tab.id ? styles.activeTab : ""}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>

              <div className={styles.toolbar}>
                <button type="button" className={styles.dateButton}>
                  <CalendarIcon />
                  <span>2025.01.01 ~ 2025.06.30</span>
                  <b>⌄</b>
                </button>

                <label className={styles.documentSearch}>
                  <SearchIcon />

                  <input
                    type="search"
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder="문서 제목 검색"
                  />
                </label>
              </div>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.documentTable}>
                <thead>
                  <tr>
                    <th>번호</th>
                    <th>문서 제목</th>
                    <th>문서 종류</th>
                    <th>기안일시</th>
                    <th>결재자</th>
                    <th>결재상태</th>
                    <th>처리기한</th>
                    <th>관리</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDocuments.map((document, index) => (
                    <tr
                      key={document.number}
                      className={index === 0 ? styles.selectedRow : ""}
                    >
                      <td className={styles.documentNumber}>
                        {document.number}
                      </td>

                      <td className={styles.documentTitle}>
                        <strong>{document.title}</strong>
                        <small>{document.attachment}</small>
                      </td>

                      <td>
                        <span
                          className={`${styles.typeBadge} ${
                            styles[document.kind]
                          }`}
                        >
                          {document.kindLabel}
                        </span>
                      </td>

                      <td>{document.createdAt}</td>

                      <td>
                        <div className={styles.approver}>
                          {document.approverInitial && (
                            <span>{document.approverInitial}</span>
                          )}

                          <p>{document.approver}</p>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            styles[document.status]
                          }`}
                        >
                          <i />
                          {document.statusLabel}
                        </span>
                      </td>

                      <td
                        className={
                          document.deadlineWarning ? styles.deadlineWarning : ""
                        }
                      >
                        {document.deadline}
                      </td>

                      <td>
                        <div className={styles.management}>
                          {document.temporary ? (
                            <>
                              <button
                                type="button"
                                aria-label={`${document.title} 수정`}
                              >
                                <EditIcon />
                              </button>

                              <button
                                type="button"
                                className={styles.deleteButton}
                                aria-label={`${document.title} 삭제`}
                              >
                                <TrashIcon />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              aria-label={`${document.title} 상세보기`}
                            >
                              <EyeIcon />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredDocuments.length === 0 && (
                    <tr>
                      <td colSpan={8} className={styles.emptyState}>
                        검색 조건에 맞는 문서가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className={styles.tableFooter}>
              <p>
                총 47건 중{" "}
                {filteredDocuments.length > 0
                  ? `1-${filteredDocuments.length}`
                  : "0"}
                표시
              </p>

              <div className={styles.pagination}>
                <button type="button" aria-label="이전 페이지">
                  ‹
                </button>

                <button type="button" className={styles.currentPage}>
                  1
                </button>

                <button type="button">2</button>
                <button type="button">3</button>

                <span>···</span>

                <button type="button">8</button>

                <button type="button" aria-label="다음 페이지">
                  ›
                </button>
              </div>
            </div>
          </section>
        </main>
    </>
  );
}
