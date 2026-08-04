"use client";

import { useMemo, useState, useEffect } from "react";
import { usePageGuard, hasPermission } from "@/utils/permission";
import { useAuthStore } from "@/store/authStore";

import type {
  ApprovalComment,
  ApprovalDocument,
  ApprovalInboxData,
  ApprovalPriority,
  AvatarTone,
  ApprovalSummary,
} from "@/types/approval";

import styles from "./ApprovalInboxPage.module.scss";

type FilterType = "all" | ApprovalPriority;

type SummaryTone = "blue" | "red" | "orange" | "green";

type SummaryIconType = "inbox" | "flash" | "clock" | "check";

interface SummaryCard {
  label: string;
  value: string;
  description: string;
  tone: SummaryTone;
  icon: SummaryIconType;
}

function getAvatarClass(tone: AvatarTone) {
  const avatarClasses: Record<AvatarTone, string> = {
    blue: styles.avatarBlue,
    green: styles.avatarGreen,
    purple: styles.avatarPurple,
    yellow: styles.avatarYellow,
    red: styles.avatarRed,
  };

  return avatarClasses[tone] || styles.avatarBlue;
}

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

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.5 16.5h11" />
      <path d="M8 16.5V10a4 4 0 1 1 8 0v6.5" />
      <path d="M10 19a2.2 2.2 0 0 0 4 0" />
    </svg>
  );
}

function DetailArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 12h10" />
      <path d="m13 7 5 5-5 5" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16v10H4z" />
      <path d="m4 8 8 6 8-6" />
    </svg>
  );
}

function UserPlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="9" r="3" />
      <path d="M3.5 19c.5-3.8 2.3-5.8 5.5-5.8s5 2 5.5 5.8" />
      <path d="M18 8v6M15 11h6" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3h8l4 4v14H7z" />
      <path d="M15 3v5h4" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 7.5h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H11l-4 3v-3H6a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

function SummaryIcon({ type }: { type: SummaryIconType }) {
  if (type === "inbox") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5v7A2.5 2.5 0 0 1 17.5 18h-11A2.5 2.5 0 0 1 4 15.5z" />
        <path d="M8 11h2l1.2 2h1.6L14 11h2" />
      </svg>
    );
  }

  if (type === "flash") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13 3 6 13h5l-1 8 8-11h-5l1-7Z" />
      </svg>
    );
  }

  if (type === "clock") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l3 2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="m8.5 12 2.4 2.4 4.8-5" />
    </svg>
  );
}

export default function ApprovalInboxPage() {
  usePageGuard("APPROVAL_INBOX", "canRead");
  
  const [filter, setFilter] = useState<FilterType>("all");
  const [keyword, setKeyword] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const [documents, setDocuments] = useState<ApprovalDocument[]>([]);
  const [comments, setComments] = useState<ApprovalComment[]>([]);
  const [summary, setSummary] = useState<ApprovalSummary | null>(null);

  const [selectedId, setSelectedId] = useState("");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");
  const { userProfile } = useAuthStore();
  // 서버가 JWT 에서 사용자를 판별하므로 화면은 표시 용도로만 사용한다.
  const currentUserId = userProfile?.employeeId ?? null;

  useEffect(() => {
    if (currentUserId) {
      fetchData();
    }
  }, [currentUserId, activeTab]);

  const fetchData = async () => {
    try {
      const endpoint = activeTab === "pending" ? "pending" : "approved";
      const res = await fetch(`/api/v1/approvals/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
        setComments(data.comments || []);
        setSummary(data.summary);
        
        if (data.documents && data.documents.length > 0 && !selectedId) {
            setSelectedId(data.documents[0].id);
            setIsDetailOpen(true);
        } else if (!data.documents || data.documents.length === 0) {
            setIsDetailOpen(false);
        }
      }
    } catch (error) {
      console.error("Failed to fetch approvals:", error);
    }
  };

  const summaryCards: SummaryCard[] = summary ? [
    {
      label: "전체 대기",
      value: `${summary.totalPending}건`,
      description: "처리 필요",
      tone: "blue",
      icon: "inbox",
    },
    {
      label: "긴급 결재",
      value: `${summary.urgentPending}건`,
      description: "즉시 처리 요망",
      tone: "red",
      icon: "flash",
    },
    {
      label: "오늘 만료",
      value: `${summary.dueToday}건`,
      description: "금일 마감",
      tone: "orange",
      icon: "clock",
    },
    {
      label: "이번달 처리",
      value: `${summary.processedThisMonth}건`,
      description: `승인율 ${summary.approvalRate}%`,
      tone: "green",
      icon: "check",
    },
  ] : [];

  const filteredDocuments = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    const result = documents.filter((document) => {
      const matchesFilter = filter === "all" || document.priority === filter;

      const matchesKeyword =
        normalizedKeyword.length === 0 ||
        document.id.toLowerCase().includes(normalizedKeyword) ||
        document.title.toLowerCase().includes(normalizedKeyword) ||
        document.drafter.toLowerCase().includes(normalizedKeyword);

      return matchesFilter && matchesKeyword;
    });

    result.sort((a, b) => {
        if (sortOrder === "desc") {
            return b.requestedAt.localeCompare(a.requestedAt);
        } else {
            return a.requestedAt.localeCompare(b.requestedAt);
        }
    });

    return result;
  }, [documents, filter, keyword, sortOrder]);

  const selectedDocument =
    documents.find((document) => document.id === selectedId) ?? documents[0];

  const selectedComments = comments.filter(
    (comment) => comment.documentId === selectedId,
  );

  const openDetailPanel = (documentId: string) => {
    setSelectedId(documentId);
    setIsDetailOpen(true);
  };

  const handleAddComment = async () => {
    const trimmedComment = commentText.trim();

    if (!trimmedComment || !selectedDocument) {
      return;
    }

    try {
        const res = await fetch(`/api/v1/approvals/${selectedDocument.id}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
            },
            body: JSON.stringify({
                content: trimmedComment,
            })
        });

        if (res.ok) {
            setCommentText("");
            fetchData();
        } else {
            alert("코멘트 등록에 실패했습니다.");
        }
    } catch (e) {
        console.error(e);
        alert("코멘트 등록 중 오류가 발생했습니다.");
    }
  };

  const handleApprove = async () => {
    if (!hasPermission("APPROVAL_INBOX", "canApprove")) {
        alert("결재 승인 권한이 없습니다.");
        return;
    }
    try {
        const res = await fetch(`/api/v1/approvals/${selectedDocument.id}/approve`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}` }
        });
        if (res.ok) {
            alert("승인 처리되었습니다.");
            fetchData();
        } else {
            alert("승인 처리에 실패했습니다.");
        }
    } catch (error) {
        console.error(error);
        alert("승인 처리 중 오류가 발생했습니다.");
    }
  };

  const handleReject = async () => {
    if (!hasPermission("APPROVAL_INBOX", "canApprove")) {
        alert("결재 처리(반려) 권한이 없습니다.");
        return;
    }
    const reason = prompt("반려 사유를 입력하세요:");
    if (reason === null) return;

    try {
        const res = await fetch(`/api/v1/approvals/${selectedDocument.id}/reject?reason=${encodeURIComponent(reason)}`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}` }
        });
        if (res.ok) {
            alert("반려 처리되었습니다.");
            fetchData();
        } else {
            const err = await res.json();
            alert(`반려 처리에 실패했습니다. ${err.message || ''}`);
        }
    } catch (error) {
        console.error(error);
        alert("반려 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
        <div
          className={`${styles.contentGrid} ${
            !isDetailOpen ? styles.detailClosed : ""
          }`}
        >
          <main className={styles.main}>
            <section className={styles.pageHeader}>
              <div>
                <h1>결재 대기함</h1>
                <p>처리가 필요한 결재 문서 및 인사/휴가 발령 목록입니다.</p>
              </div>

              <button type="button" className={styles.exportButton}>
                <DownloadIcon />
                <span>내보내기</span>
              </button>
            </section>

            <div className={styles.tabs} role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "pending"}
                className={activeTab === "pending" ? styles.activeTab : ""}
                onClick={() => setActiveTab("pending")}
              >
                대기 중
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "approved"}
                className={activeTab === "approved" ? styles.activeTab : ""}
                onClick={() => setActiveTab("approved")}
              >
                처리 완료
              </button>
            </div>

            <section className={styles.summaryGrid}>
              {summaryCards.map((card) => (
                <article key={card.label} className={styles.summaryCard}>
                  <div className={styles.summaryBody}>
                    <p>{card.label}</p>
                    <h2>{card.value}</h2>

                    <span className={styles[`${card.tone}Text`]}>
                      {card.description}
                    </span>
                  </div>

                  <span
                    className={`${styles.summaryIcon} ${
                      styles[`${card.tone}Icon`]
                    }`}
                  >
                    <SummaryIcon type={card.icon} />
                  </span>
                </article>
              ))}
            </section>

            <section className={styles.tableCard}>
              <div className={styles.tableToolbar}>
                <div className={styles.filterButtons}>
                  <button
                    type="button"
                    className={filter === "all" ? styles.activeFilter : ""}
                    onClick={() => setFilter("all")}
                  >
                    전체
                  </button>

                  <button
                    type="button"
                    className={filter === "urgent" ? styles.activeFilter : ""}
                    onClick={() => setFilter("urgent")}
                  >
                    긴급
                  </button>

                  <button
                    type="button"
                    className={filter === "normal" ? styles.activeFilter : ""}
                    onClick={() => setFilter("normal")}
                  >
                    일반
                  </button>

                  <button
                    type="button"
                    className={styles.sortButton}
                    onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
                  >
                    {sortOrder === "desc" ? "최신순 ↓" : "오래된순 ↑"}
                  </button>
                </div>

                <label className={styles.tableSearch}>
                  <SearchIcon />

                  <input
                    type="search"
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder="문서 검색"
                  />
                </label>
              </div>

              <div className={styles.tableWrapper}>
                <table className={styles.approvalTable}>
                  <thead>
                    <tr>
                      <th>우선</th>
                      <th>문서번호</th>
                      <th>결재 제목</th>
                      <th>기안자</th>
                      <th>요청일</th>
                      <th>D-day</th>
                      <th>상세</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredDocuments.map((document) => {
                      const isSelected =
                        selectedId === document.id && isDetailOpen;

                      return (
                        <tr
                          key={document.id}
                          className={isSelected ? styles.selectedRow : ""}
                          onClick={() => openDetailPanel(document.id)}
                        >
                          <td>
                            <span
                              className={`${styles.priorityBadge} ${
                                document.priority === "urgent"
                                  ? styles.urgent
                                  : styles.normal
                              }`}
                            >
                              {document.priorityLabel}
                            </span>
                          </td>

                          <td className={styles.documentId}>{document.id}</td>

                          <td className={styles.documentTitle}>
                            <strong>{document.title}</strong>

                            <small>{document.attachment}</small>
                          </td>

                          <td>
                            <div className={styles.drafter}>
                              <span
                                className={`${styles.avatar} ${getAvatarClass(
                                  document.avatarTone,
                                )}`}
                              >
                                {document.drafterInitial}
                              </span>

                              <p>{document.drafter}</p>
                            </div>
                          </td>

                          <td>{document.requestedAt}</td>

                          <td>
                            <span
                              className={`${styles.dDay} ${
                                document.dDay === "D-0"
                                  ? styles.dDayUrgent
                                  : styles.dDayNormal
                              }`}
                            >
                              {document.dDay}
                            </span>
                          </td>

                          <td>
                            <button
                              type="button"
                              className={`${styles.detailButton} ${
                                isSelected ? styles.detailButtonActive : ""
                              }`}
                              aria-label={`${document.title} 상세보기`}
                              onClick={(event) => {
                                event.stopPropagation();

                                openDetailPanel(document.id);
                              }}
                            >
                              <DetailArrowIcon />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredDocuments.length === 0 && (
                      <tr>
                        <td colSpan={7} className={styles.emptyState}>
                          조회된 결재 문서가 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className={styles.tableFooter}>
                <p>
                  총 {documents.length}건 중{" "}
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

                  <button type="button" aria-label="다음 페이지">
                    ›
                  </button>
                </div>
              </div>
            </section>
          </main>

          {isDetailOpen && selectedDocument && (
            <aside className={styles.detailPanel}>
              <div className={styles.detailHeader}>
                <div>
                  <small>문서 상세</small>
                  <strong>{selectedDocument.id}</strong>
                </div>

                <button
                  type="button"
                  aria-label="상세 패널 닫기"
                  onClick={() => setIsDetailOpen(false)}
                >
                  ×
                </button>
              </div>

              <div className={styles.documentSummary}>
                <div className={styles.summaryBadges}>
                  <span className={styles.summaryBadgeUrgent}>
                    {selectedDocument.priorityLabel}
                  </span>

                  <span className={styles.summaryBadgeDeadline}>
                    {selectedDocument.dDay}{" "}
                    {selectedDocument.dDay === "D-0"
                      ? "오늘 마감"
                      : "처리 예정"}
                  </span>
                </div>

                <h2>{selectedDocument.title}</h2>

                <p>
                  <span>◷ {selectedDocument.requestedAt}</span>

                  <span>{selectedDocument.attachment}</span>
                </p>
              </div>

              <div className={styles.detailContent}>
                <section className={styles.detailSection}>
                  <h3>기안자 정보</h3>

                  <div className={styles.userCard}>
                    <span
                      className={`${styles.userAvatar} ${getAvatarClass(
                        selectedDocument.avatarTone,
                      )}`}
                    >
                      {selectedDocument.drafterInitial}
                    </span>

                    <div className={styles.userInfo}>
                      <strong>{selectedDocument.drafter}</strong>

                      <small>
                        {selectedDocument.drafterDepartment} ·{" "}
                        {selectedDocument.drafterRole}
                      </small>
                    </div>

                    <div className={styles.userActions}>
                      <button type="button" aria-label="메일 보내기">
                        <MailIcon />
                      </button>

                      <button type="button" aria-label="사용자 추가">
                        <UserPlusIcon />
                      </button>
                    </div>
                  </div>
                </section>

                <section className={styles.detailSection}>
                  <h3>상세 내용</h3>
                  {(() => {
                    const content = selectedDocument.description || "";
                    if (content.includes("leaveType")) {
                      try {
                        const leaveData = JSON.parse(content);
                        return (
                          <div style={{ background: '#ebf8ff', padding: '1rem', borderRadius: '8px', border: '1px solid #bee3f8' }}>
                            <p style={{ margin: '0 0 0.5rem 0' }}><strong>휴가 종류:</strong> {leaveData.leaveType}</p>
                            <p style={{ margin: '0 0 0.5rem 0' }}><strong>시작일:</strong> {leaveData.startDate}</p>
                            <p style={{ margin: '0 0 0.5rem 0' }}><strong>종료일:</strong> {leaveData.endDate}</p>
                            <p style={{ margin: '0 0 0.5rem 0' }}><strong>신청 일수:</strong> {leaveData.days} 일</p>
                            <p style={{ margin: 0 }}><strong>사유:</strong> {leaveData.reason}</p>
                          </div>
                        );
                      } catch (e) {
                        return <div className={styles.requestContent} dangerouslySetInnerHTML={{ __html: content }} />;
                      }
                    }
                    if (content.includes("welfareAmount")) {
                      try {
                        const welfareData = JSON.parse(content);
                        return (
                          <div style={{ background: '#f0fff4', padding: '1rem', borderRadius: '8px', border: '1px solid #c6f6d5' }}>
                            <p style={{ margin: '0 0 0.5rem 0' }}><strong>경조금 신청 금액:</strong> {Number(welfareData.welfareAmount).toLocaleString()} 원</p>
                            <p style={{ margin: 0 }}><strong>상세 내용:</strong> {welfareData.text}</p>
                          </div>
                        );
                      } catch (e) {
                        return <div className={styles.requestContent} dangerouslySetInnerHTML={{ __html: content }} />;
                      }
                    }
                    return <div className={styles.requestContent} dangerouslySetInnerHTML={{ __html: content }} />;
                  })()}
                </section>

                {selectedDocument.fileName && (
                    <section className={styles.detailSection}>
                    <h3>첨부 파일</h3>

                    <div className={styles.fileCard}>
                        <span className={styles.fileIconBox}>
                        <FileIcon />
                        </span>

                        <div className={styles.fileInfo}>
                        <strong>{selectedDocument.fileName}</strong>

                        <small>{selectedDocument.fileMeta}</small>
                        </div>

                        <button type="button" className={styles.fileDownload}>
                        ↓ 다운
                        </button>
                    </div>
                    </section>
                )}

                <section className={styles.commentSection}>
                  <div className={styles.commentHeader}>
                    <div className={styles.commentTitle}>
                      <ChatIcon />
                      <h3>의견 및 코멘트</h3>
                    </div>

                    <span>{selectedComments.length}</span>
                  </div>

                  <div className={styles.commentList}>
                    {selectedComments.map((comment) => (
                      <article key={comment.id} className={styles.commentItem}>
                        <span
                          className={`${styles.commentAvatar} ${getAvatarClass(
                            comment.avatarTone,
                          )}`}
                        >
                          {comment.initial}
                        </span>

                        <div className={styles.commentBody}>
                          <header>
                            <div className={styles.commentMeta}>
                              <strong>{comment.name}</strong>

                              {comment.tag && <em>{comment.tag}</em>}
                            </div>

                            <small>{comment.time}</small>
                          </header>

                          <p>{comment.content}</p>
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className={styles.commentInput}>
                    <span
                      className={`${styles.commentAvatar} ${styles.avatarBlue}`}
                    >
                      나
                    </span>

                    <input
                      type="text"
                      value={commentText}
                      onChange={(event) => setCommentText(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          handleAddComment();
                        }
                      }}
                      placeholder="의견을 입력하세요..."
                    />

                    <button
                      type="button"
                      disabled={!commentText.trim()}
                      onClick={handleAddComment}
                    >
                      전송
                    </button>
                  </div>
                </section>
              </div>

              <div className={styles.detailActions}>
                <button 
                  type="button" 
                  className={styles.rejectButton}
                  onClick={handleReject}
                >
                  × 반려
                </button>

                <button 
                  type="button" 
                  className={styles.approveButton}
                  onClick={handleApprove}
                >
                  ✓ 승인
                </button>
              </div>
            </aside>
          )}
        </div>
    </>
  );
}
