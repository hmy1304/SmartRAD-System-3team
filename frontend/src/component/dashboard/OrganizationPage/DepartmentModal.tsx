"use client";

import { useState, useEffect } from "react";
import styles from "./OrganizationPage.module.scss";

// Type definitions based on V25 schema
export interface DepartmentTreeData {
  id: number;
  name: string;
  deptCode: string;
  nameEn: string;
  managerId: number | null;
  managerName: string | null;
  managerPosition: string | null;
  location: string;
  phone: string;
  establishedDate: string;
  description: string;
  parentId?: number | null;
  parentName?: string | null;
  memberCount: number;
  totalSubMemberCount: number;
  children: DepartmentTreeData[];
}

export interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  editData?: any; // null if create mode, otherwise data to edit
  departments: { id: number; name: string; parentId?: number | null }[]; // flat list for parent selection
  employees: { id: number; name: string; position?: string }[]; // for manager selection
}

export default function DepartmentModal({
  isOpen,
  onClose,
  onSubmit,
  editData,
  departments,
  employees,
}: DepartmentModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    nameEn: "",
    deptCode: "",
    parentId: "",
    managerId: "",
    location: "",
    phone: "",
    establishedDate: "",
    description: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && editData) {
      setFormData({
        name: editData.name || "",
        nameEn: editData.nameEn || "",
        deptCode: editData.deptCode || "",
        parentId: editData.parentId ? String(editData.parentId) : "",
        managerId: editData.managerId ? String(editData.managerId) : "",
        location: editData.location || "",
        phone: editData.phone || "",
        establishedDate: editData.establishedDate || "",
        description: editData.description || "",
      });
    } else if (isOpen) {
      setFormData({
        name: "",
        nameEn: "",
        deptCode: "",
        parentId: "",
        managerId: "",
        location: "",
        phone: "",
        establishedDate: "",
        description: "",
      });
    }
  }, [isOpen, editData]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.deptCode) {
      alert("부서명과 부서 코드는 필수입니다.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const submitData = {
        name: formData.name,
        nameEn: formData.nameEn,
        deptCode: formData.deptCode,
        parentId: formData.parentId ? Number(formData.parentId) : null,
        managerId: formData.managerId ? Number(formData.managerId) : null,
        location: formData.location,
        phone: formData.phone,
        establishedDate: formData.establishedDate || null,
        description: formData.description,
      };
      
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error(error);
      alert("처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleBox}>
            <div className={styles.modalIcon}>🏢</div>
            <div>
              <h3>{editData ? "부서 수정" : "부서 등록"}</h3>
              <p>{editData ? "조직의 부서 정보를 수정합니다." : "새로운 부서 정보를 입력하고 조직에 추가합니다."}</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>기본 정보</h4>
            <div className={styles.formRow2}>
              <div className={styles.formGroup}>
                <label>부서명 (한국어) *</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="부서명 입력(한국어)"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>부서명 (영문)</label>
                <input
                  name="nameEn"
                  value={formData.nameEn}
                  onChange={handleChange}
                  placeholder="부서명 입력(영문)"
                />
              </div>
            </div>

            <div className={styles.formRow2}>
              <div className={styles.formGroup}>
                <label>부서 코드 *</label>
                <input
                  name="deptCode"
                  value={formData.deptCode}
                  onChange={handleChange}
                  placeholder="예: DEPT-1019"
                  required
                  disabled={!!editData} // 수정 시 코드 변경 불가
                  className={editData ? styles.disabledInput : ""}
                />
              </div>
              <div className={styles.formGroup}>
                <label>상위 부서</label>
                <select name="parentId" value={formData.parentId} onChange={handleChange} required>
                  <option value="" disabled={departments.some(d => !d.parentId) && !(editData && !editData.parentId)}>
                    {departments.some(d => !d.parentId) && !(editData && !editData.parentId) ? "상위 부서를 선택하세요" : "(최상위 부서)"}
                  </option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>담당자 및 위치 정보</h4>
            <div className={styles.formRow2}>
              <div className={styles.formGroup}>
                <label>부서장</label>
                <select name="managerId" value={formData.managerId} onChange={handleChange}>
                  <option value="">선택안함</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} {e.position ? `(${e.position})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>위치</label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="위치 입력 (예: 본관 3층)"
                />
              </div>
            </div>

            <div className={styles.formRow2}>
              <div className={styles.formGroup}>
                <label>내선 번호</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="번호 입력 (예: 02-1234-5678)"
                />
              </div>
              <div className={styles.formGroup}>
                <label>설립일</label>
                <input
                  type="date"
                  name="establishedDate"
                  value={formData.establishedDate}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>부서 설명</h4>
            <div className={styles.formGroup}>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="부서의 주요 업무 및 역할을 입력하세요."
                rows={3}
              />
            </div>
          </div>

          <div className={styles.modalActions}>
            <button type="button" className={styles.outlineBtn} onClick={onClose} disabled={isSubmitting}>
              취소
            </button>
            <button type="submit" className={styles.primaryBtn} disabled={isSubmitting}>
              {isSubmitting ? "처리 중..." : editData ? "정보 수정" : "부서 등록"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
