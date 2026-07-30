"use client";

import { useState, useEffect } from "react";
import styles from "./DraftRegisterModal.module.scss";
import { createDocument } from "@/services/approvalService";
import { getEmployees } from "@/services/employeeService";
import { useCommonCodes } from "@/hooks/useCommonCodes";

interface DraftRegisterModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function DraftRegisterModal({ onClose, onSuccess }: DraftRegisterModalProps) {
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState("DOC_VACATION");
  const [content, setContent] = useState("");
  const [leaveType, setLeaveType] = useState("연차");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [days, setDays] = useState(1);
  const [reason, setReason] = useState("");
  const [welfareAmount, setWelfareAmount] = useState<number | "">("");

  const [approverId, setApproverId] = useState(""); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);

  const { codes } = useCommonCodes(["DOC_TYPE"]);

  useEffect(() => {
    async function loadEmployees() {
      try {
        const data = await getEmployees();
        // getEmployees returns an object with content or the array directly, let's assume it has .content for paginated response
        const empList = (data as any).content || data || [];
        // 본인(ID: 1)은 결재자로 선택할 수 없도록 제외
        setEmployees(empList.filter((emp: any) => emp.id !== 1));
      } catch (e) {
        console.error(e);
      }
    }
    loadEmployees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !approverId) {
      alert("문서 제목과 결재자를 선택해주세요.");
      return;
    }

    let finalContent = content;

    if (docType === "DOC_VACATION") {
      if (!startDate || !endDate || !reason) {
        alert("휴가 신청 정보를 모두 입력해주세요.");
        return;
      }
      finalContent = JSON.stringify({ leaveType, startDate, endDate, days, reason });
    } else if (docType === "DOC_WELFARE") {
      if (!welfareAmount || welfareAmount <= 0) {
        alert("신청 금액을 올바르게 입력해주세요.");
        return;
      }
      finalContent = JSON.stringify({
        text: content,
        welfareAmount: welfareAmount
      });
    } else {
      if (!content) {
        alert("상세 내용을 입력해주세요.");
        return;
      }
    }

    try {
      setIsSubmitting(true);
      
      const payload = {
        title: title,
        content: finalContent,
        docTypeCode: docType, // Send string, e.g. "DOC_GENERAL"
        draftedById: 1, // Mock current user
        approverIds: [parseInt(approverId)],
        attachmentFileNames: []
      };

      await createDocument(payload);
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("문서 기안 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>📝</div>
            <div>
              <h2>새 문서 기안</h2>
              <p>새로운 결재 문서를 작성하여 상신합니다.</p>
            </div>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.body}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.barBlue}></span>
            기본 정보 입력
          </h3>

          <div className={styles.formGroup}>
            <label>문서 종류<b>*</b></label>
            <select value={docType} onChange={(e) => setDocType(e.target.value)}>
              {codes.DOC_TYPE ? codes.DOC_TYPE.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              )) : (
                <>
                  <option value="DOC_VACATION">휴가 신청서</option>
                  <option value="DOC_WELFARE">복리후생 신청서</option>
                  <option value="DOC_CERT">제증명 신청서</option>
                </>
              )}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>문서 제목<b>*</b></label>
            <input 
              type="text" 
              placeholder="제목을 입력하세요" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>결재자<b>*</b></label>
            <select 
              value={approverId}
              onChange={(e) => setApproverId(e.target.value)}
            >
              <option value="">결재자를 선택하세요</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.empNo})
                </option>
              ))}
            </select>
          </div>

          <h3 className={styles.sectionTitle} style={{ marginTop: '8px' }}>
            <span className={styles.barGreen}></span>
            {docType === "DOC_VACATION" ? "휴가 정보" : "기안 내용"}
          </h3>

          {docType === "DOC_WELFARE" ? (
            <>
              <div className={styles.formGroup}>
                <label>신청 금액(원)<b>*</b></label>
                <input 
                  type="number" 
                  min="0"
                  value={welfareAmount}
                  onChange={(e) => setWelfareAmount(e.target.value ? Number(e.target.value) : "")}
                  placeholder="예: 100000"
                />
              </div>
              <div className={styles.formGroup}>
                <label>상세 내용</label>
                <textarea 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)} 
                  placeholder="지급 대상 및 사유를 상세히 적어주세요." 
                  rows={4} 
                />
              </div>
            </>
          ) : docType === "DOC_VACATION" ? (
            <>
              <div className={styles.formGroup}>
                <label>휴가 종류<b>*</b></label>
                <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
                  <option value="연차">연차</option>
                  <option value="반차 (오전)">반차 (오전)</option>
                  <option value="반차 (오후)">반차 (오후)</option>
                  <option value="병가">병가</option>
                  <option value="기타">기타</option>
                </select>
              </div>
              <div className={styles.formGroupRow}>
                <div className={styles.formGroup}>
                  <label>시작일<b>*</b></label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label>종료일<b>*</b></label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label>신청 일수<b>*</b></label>
                  <input type="number" step="0.5" min="0" value={days} onChange={(e) => setDays(parseFloat(e.target.value))} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>휴가 사유<b>*</b></label>
                <textarea 
                  placeholder="사유를 상세히 작성해주세요" 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </>
          ) : (
            <div className={styles.formGroup}>
              <label>상세 내용<b>*</b></label>
              <textarea 
                placeholder="내용을 상세히 작성해주세요" 
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          )}
        </form>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            취소
          </button>
          <button 
            type="button" 
            className={styles.submitButton} 
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? "기안 중..." : "결재 상신"}
          </button>
        </div>
      </div>
    </div>
  );
}
