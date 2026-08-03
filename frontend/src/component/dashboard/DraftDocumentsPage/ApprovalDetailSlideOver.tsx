"use client";

import { useEffect, useState } from "react";
import styles from "./ApprovalDetailSlideOver.module.scss";
import { getApprovalDetail } from "@/services/approvalService";

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

interface ApprovalDetailSlideOverProps {
  documentId: number | string;
  onClose: () => void;
}

const getAvatarClass = (tone: string) => {
  switch (tone) {
    case "blue": return styles.avatarBlue;
    case "green": return styles.avatarGreen;
    case "purple": return styles.avatarPurple;
    case "yellow": return styles.avatarYellow;
    case "red": return styles.avatarRed;
    default: return "";
  }
};

export default function ApprovalDetailSlideOver({ documentId, onClose }: ApprovalDetailSlideOverProps) {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        const idString = typeof documentId === 'number' ? documentId.toString() : documentId;
        const data = await getApprovalDetail(idString);
        setDetail(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (documentId) {
      fetchDetail();
    }
  }, [documentId]);

  const renderContent = () => {
    if (!detail || !detail.document) return null;
    const doc = detail.document;

    // Check if it's vacation document by docTypeName or if content looks like JSON with leaveType
    if (doc.docTypeName === "휴가 신청서" || doc.docTypeName === "DOC_VACATION" || (detail.content && detail.content.includes("leaveType"))) {
      try {
        const leaveData = JSON.parse(detail.content);
        return (
          <div className={styles.leaveDetails}>
            <div className={styles.row}>
              <span className={styles.label}>휴가 종류</span>
              <span className={styles.value}>{leaveData.leaveType}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>시작일</span>
              <span className={styles.value}>{leaveData.startDate}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>종료일</span>
              <span className={styles.value}>{leaveData.endDate}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>신청 일수</span>
              <span className={styles.value}>{leaveData.days} 일</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>사유</span>
              <span className={styles.value}>{leaveData.reason}</span>
            </div>
          </div>
        );
      } catch (e) {
        return <div className={styles.documentBody} dangerouslySetInnerHTML={{ __html: detail.content }} />;
      }
    }
    
    // Check if it's welfare document
    if (doc.docTypeName === "경조금 신청서" || doc.docTypeName === "DOC_WELFARE" || (detail.content && detail.content.includes("welfareAmount"))) {
      try {
        const welfareData = JSON.parse(detail.content);
        return (
          <div className={styles.leaveDetails}>
            <div className={styles.row}>
              <span className={styles.label}>신청 금액</span>
              <span className={styles.value}>{Number(welfareData.welfareAmount).toLocaleString()} 원</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>상세 내용</span>
              <span className={styles.value}>{welfareData.text}</span>
            </div>
          </div>
        );
      } catch (e) {
        return <div className={styles.documentBody} dangerouslySetInnerHTML={{ __html: detail.content }} />;
      }
    }

    return <div className={styles.documentBody} dangerouslySetInnerHTML={{ __html: detail.content }} />;
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.slideOver} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{detail ? detail.document.title : "문서 상세"}</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        
        <div className={styles.content}>
          {loading ? (
            <p style={{ textAlign: 'center', marginTop: '2rem' }}>로딩 중...</p>
          ) : detail ? (
            <>
              <div className={styles.meta}>
                <div className={styles.metaRow}>
                  <span className={styles.label}>문서 번호</span>
                  <span className={styles.value}>{detail.document.docNumber}</span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.label}>기안자</span>
                  <span className={styles.value}>{detail.document.draftedByName}</span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.label}>상태</span>
                  <span className={styles.value}>
                    {detail.document.status === 'WAITING' ? '결재 대기' : 
                     detail.document.status === 'COMPLETED' ? '결재 완료' : 
                     detail.document.status === 'REJECTED' ? '반려' : detail.document.status}
                  </span>
                </div>
              </div>
              
              {renderContent()}
              
              <h3 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.1rem', color: '#2d3748', fontWeight: 'bold' }}>결재선</h3>
              <div className={styles.meta}>
                {detail.approvalLines && detail.approvalLines.map((line: any, idx: number) => (
                  <div key={idx} className={styles.metaRow} style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <span className={styles.label}>{idx + 1}차 결재 ({line.approverName})</span>
                      <span className={styles.value} style={{ color: line.status === 'REJECTED' ? '#e53e3e' : line.status === 'APPROVED' ? '#38a169' : 'inherit' }}>
                        {line.status === 'WAITING' ? '대기 중' :
                         line.status === 'APPROVED' ? '승인' :
                         line.status === 'REJECTED' ? '반려' : line.status}
                      </span>
                    </div>
                    {line.status === 'REJECTED' && line.rejectReason && (
                      <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: '#fff5f5', borderLeft: '3px solid #fc8181', color: '#c53030', fontSize: '0.85rem', width: '100%', borderRadius: '0 4px 4px 0' }}>
                        <strong>반려 사유:</strong> {line.rejectReason}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {detail.comments && detail.comments.length > 0 && (
                <section className={styles.commentSection}>
                  <div className={styles.commentHeader}>
                    <div className={styles.commentTitle}>
                      <ChatIcon />
                      <h3>의견 및 코멘트</h3>
                    </div>
                    <span>{detail.comments.length}</span>
                  </div>

                  <div className={styles.commentList}>
                    {detail.comments.map((comment: any) => (
                      <article key={comment.id} className={styles.commentItem}>
                        <span className={`${styles.commentAvatar} ${getAvatarClass(comment.avatarTone)}`}>
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
                </section>
              )}
            </>
          ) : (
            <p>데이터를 불러오지 못했습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
