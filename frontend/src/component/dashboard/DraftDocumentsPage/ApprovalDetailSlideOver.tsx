"use client";

import { useEffect, useState } from "react";
import styles from "./ApprovalDetailSlideOver.module.scss";
import { getApprovalDetail } from "@/services/approvalService";

interface ApprovalDetailSlideOverProps {
  documentId: number | string;
  onClose: () => void;
}

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
        return <div className={styles.documentBody}>{detail.content}</div>;
      }
    }

    return <div className={styles.documentBody}>{detail.content}</div>;
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
                  <div key={idx} className={styles.metaRow} style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                    <span className={styles.label}>{idx + 1}차 결재 ({line.approverName})</span>
                    <span className={styles.value}>
                      {line.status === 'WAITING' ? '대기 중' :
                       line.status === 'APPROVED' ? '승인' :
                       line.status === 'REJECTED' ? '반려' : line.status}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p>데이터를 불러오지 못했습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
