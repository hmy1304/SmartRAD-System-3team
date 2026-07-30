"use client";

import { useState, useEffect } from "react";
import styles from "./DraftRegisterModal.module.scss";
import { createDocument } from "@/services/approvalService";
import { getEmployees } from "@/services/employeeService";

interface DraftRegisterModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function DraftRegisterModal({ onClose, onSuccess }: DraftRegisterModalProps) {
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState("DOC_VACATION");
  const [content, setContent] = useState("");
  const [approverId, setApproverId] = useState(""); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);

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
    
    if (!title || !content || !approverId) {
      alert("모든 필수 항목을 올바르게 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload = {
        title: title,
        content: content,
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
              <option value="DOC_VACATION">휴가 신청서</option>
              <option value="DOC_WELFARE">복리후생 신청서</option>
              <option value="DOC_CERT">제증명 신청서</option>
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
            기안 내용
          </h3>

          <div className={styles.formGroup}>
            <label>상세 내용<b>*</b></label>
            <textarea 
              placeholder="내용을 상세히 작성해주세요" 
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
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
