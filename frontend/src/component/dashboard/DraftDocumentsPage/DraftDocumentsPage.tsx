"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import styles from "./DraftDocumentsPage.module.scss";

import { 
  DocumentIcon, PendingIcon, CheckIcon, RejectIcon, 
  DraftIcon, EditIcon, TrashIcon, EyeIcon, 
  DownloadIcon, PlusIcon, CalendarIcon, SearchIcon 
} from "./icons/Icons";

import { getDraftApprovals } from "@/services/approvalService";
import type { ApprovalDraftData, DraftDocument } from "@/types/approval";
import DraftRegisterModal from "./DraftRegisterModal";
import ApprovalDetailSlideOver from "./ApprovalDetailSlideOver";

const SummaryIcon = ({ name }: { name: string }) => {
  switch (name) {
    case "document": return <DocumentIcon />;
    case "pending": return <PendingIcon />;
    case "check": return <CheckIcon />;
    case "reject": return <RejectIcon />;
    case "draft": return <DraftIcon />;
    default: return null;
  }
};

export default function DraftDocumentsPage() {
  const [data, setData] = useState<ApprovalDraftData | null>(null);
  const [activeTab, setActiveTab] = useState("ALL");
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 7;
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 2);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | number | null>(null);
  const { userProfile } = useAuthStore();
  const canEdit = useMemo(() => {
    const perm = userProfile?.perms?.find(p => p.menuCode === 'APPROVAL_DRAFT');
    return perm ? perm.canWrite : false;
  }, [userProfile]);

  // In real app, fetch drafterId from context/session. 
  // We use a mock ID for demo purposes.
  const drafterId = "1"; 

  const fetchData = async () => {
    try {
      const res = await getDraftApprovals(drafterId, activeTab);
      setData(res);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // 필터가 변경되면 페이지를 1로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, startDate, endDate, activeTab]);

  if (!data) return <div>Loading...</div>;

  const summaryCards = [
    { label: "전체 기안", value: data.summary.totalDrafts, tone: "purple", description: "상신된 문서 수", icon: "document" },
    { label: "진행 대기", value: data.summary.pendingDrafts, tone: "blue", description: "결재 대기 문서", icon: "pending" },
    { label: "결재 완료", value: data.summary.approvedThisMonth, tone: "green", description: "이번 달 완료", icon: "check" },
    { label: "반려 문서", value: data.summary.rejectedDrafts, tone: "red", description: "재작성 필요", icon: "reject" },
    { label: "임시 저장", value: data.summary.temporaryDrafts, tone: "gray", description: "작성 중인 문서", icon: "draft" },
  ];

  const tabs = [
    { id: "ALL", label: "전체보기", count: data.summary.totalDrafts },
    { id: "IN_PROGRESS", label: "진행중", count: data.tabs.inProgress },
    { id: "REJECTED", label: "반려", count: data.tabs.rejected },
    { id: "COMPLETED", label: "결재완료", count: data.tabs.approved },
    { id: "DRAFT", label: "임시저장", count: data.tabs.temporary },
  ];

  const filteredDocuments = data.documents.filter(doc => {
    const matchesKeyword = doc.title.toLowerCase().includes(keyword.toLowerCase());
    const docDate = new Date(doc.createdAt).getTime();
    
    let matchesStartDate = true;
    if (startDate) {
      matchesStartDate = docDate >= new Date(startDate).getTime();
    }
    
    let matchesEndDate = true;
    if (endDate) {
      matchesEndDate = docDate <= new Date(endDate + "T23:59:59").getTime();
    }
    
    return matchesKeyword && matchesStartDate && matchesEndDate;
  });

  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE));
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      <main className={styles.draftContainer}>
        <section className={styles.header}>
          <div>
            <h1>기안 문서함</h1>
            <p>내가 기안한 문서 목록을 확인하고 관리할 수 있습니다.</p>
          </div>

          <div className={styles.headerActions}>
            <button type="button" className={styles.excelButton}>
              <DownloadIcon />
              엑셀 다운로드
            </button>

            <button 
              type="button" 
              className={styles.newDocumentButton} 
              onClick={() => setIsModalOpen(true)}
              disabled={!canEdit}
              title={!canEdit ? "수정 권한이 없습니다" : undefined}
            >
              <PlusIcon /> 새 결재 진행
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
                  {card.description}
                </span>
              </div>
              <span className={`${styles.summaryIcon} ${styles[`${card.tone}Icon`]}`}>
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
              <div className={styles.dateFilter}>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  className={styles.dateInput}
                />
                <span>~</span>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className={styles.dateInput}
                />
              </div>

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
                {paginatedDocuments.map((document, index) => (
                  <tr key={document.id}>
                    <td className={styles.documentNumber}>{document.number}</td>
                    <td className={styles.documentTitle}>
                      <strong>{document.title}</strong>
                      <small>{document.attachment}</small>
                    </td>
                    <td>
                      <span className={`${styles.typeBadge} ${styles[document.kind] || styles.defaultKind}`}>
                        {document.kindLabel}
                      </span>
                    </td>
                    <td>{document.createdAt}</td>
                    <td>
                      <div className={styles.approver}>
                        {document.approverInitial && <span>{document.approverInitial}</span>}
                        <p>{document.approver}</p>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[document.status] || styles.defaultStatus}`}>
                        <i />
                        {document.statusLabel}
                      </span>
                    </td>
                    <td className={document.deadlineWarning ? styles.deadlineWarning : ""}>
                      {document.deadline}
                    </td>
                    <td>
                      <div className={styles.management}>
                        {document.temporary ? (
                          <>
                            <button 
                              type="button" 
                              aria-label="수정"
                              disabled={!canEdit}
                              title={!canEdit ? "수정 권한이 없습니다" : undefined}
                            ><EditIcon /></button>
                            <button 
                              type="button" 
                              className={styles.deleteButton} 
                              aria-label="삭제"
                              disabled={!canEdit}
                              title={!canEdit ? "수정 권한이 없습니다" : undefined}
                            ><TrashIcon /></button>
                          </>
                        ) : (
                          <button type="button" aria-label="상세보기" onClick={() => setSelectedDocumentId(document.id)}>
                            <EyeIcon />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedDocuments.length === 0 && (
                  <tr>
                    <td colSpan={8} className={styles.emptyState}>검색 조건에 맞는 문서가 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button 
                type="button" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                이전
              </button>
              
              <div className={styles.pageNumbers}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    type="button"
                    className={currentPage === pageNum ? styles.activePage : ""}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button 
                type="button" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                다음
              </button>
            </div>
          )}
        </section>
      </main>

      {isModalOpen && (
        <DraftRegisterModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchData();
          }} 
        />
      )}

      {selectedDocumentId && (
        <ApprovalDetailSlideOver 
          documentId={selectedDocumentId} 
          onClose={() => setSelectedDocumentId(null)} 
        />
      )}
    </>
  );
}
