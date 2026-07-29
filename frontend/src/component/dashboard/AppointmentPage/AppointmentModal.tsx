"use client";

import { useState, useEffect } from "react";
import styles from "./AppointmentPage.module.scss";
import { createAppointment } from "@/services/appointmentService";
import type { AppointmentCreateRequest } from "@/services/appointmentService";
import { FileText, X } from "lucide-react";

interface CommonCode {
  code: string;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  empNo: string;
  name: string;
  departmentName: string;
  positionName: string;
}

interface AppointmentModalProps {
  onClose: () => void;
  onSuccess: () => void;
  employees: Employee[];
  departments: Department[];
  appointmentTypes: CommonCode[];
  positions: CommonCode[];
}

export default function AppointmentModal({
  onClose,
  onSuccess,
  employees,
  departments,
  appointmentTypes,
  positions,
}: AppointmentModalProps) {
  const [formData, setFormData] = useState<AppointmentCreateRequest>({
    employeeId: 0,
    appointmentTypeCode: "",
    afterDepartmentId: null,
    afterPositionCode: null,
    afterPayStep: null,
    applyDate: "",
    note: "",
  });

  // Default values
  useEffect(() => {
    if (appointmentTypes.length > 0 && !formData.appointmentTypeCode) {
      setFormData((prev) => ({ ...prev, appointmentTypeCode: appointmentTypes[0].code }));
    }
  }, [appointmentTypes]);

  // Autofill current department, position, payStep when employee is selected
  useEffect(() => {
    if (formData.employeeId > 0) {
      const fetchEmployeeDetails = async () => {
        try {
          const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
          };
          const res = await fetch(`/api-system/employees/${formData.employeeId}`, { headers });
          if (res.ok) {
            const data = await res.json();
            setFormData((prev) => ({
              ...prev,
              afterDepartmentId: data.departmentId || null,
              afterPositionCode: data.positionCode || null,
              afterPayStep: data.payStep || null,
            }));
          }
        } catch (error) {
          console.error("Failed to fetch employee details", error);
        }
      };
      fetchEmployeeDetails();
    } else {
      setFormData((prev) => ({
        ...prev,
        afterDepartmentId: null,
        afterPositionCode: null,
        afterPayStep: null,
      }));
    }
  }, [formData.employeeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.employeeId === 0) {
      alert("대상자를 선택해주세요.");
      return;
    }
    
    try {
      await createAppointment({
        ...formData,
        afterDepartmentId: formData.afterDepartmentId ? Number(formData.afterDepartmentId) : null,
        afterPayStep: formData.afterPayStep ? Number(formData.afterPayStep) : null,
      });
      onSuccess();
    } catch (error) {
      alert("발령 등록에 실패했습니다.");
      console.error(error);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.modalIconBox}>
              <FileText size={24} color="#ffffff" />
            </div>
            <div>
              <h2>발령 등록</h2>
              <p>신규 인사발령 내역을 등록합니다.</p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className={styles.modalBody}>
            <div className={styles.formSection}>
              <h4 className={styles.sectionTitle}>
                <span className={styles.barAccent}>|</span> 발령 대상자 *
              </h4>
              <div className={styles.inputBox}>
                <select
                  required
                  value={formData.employeeId}
                  onChange={e => setFormData({...formData, employeeId: Number(e.target.value)})}
                >
                  <option value={0}>대상자 선택</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.departmentName} / {emp.positionName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formSection}>
              <h4 className={styles.sectionTitle}>
                <span className={styles.barAccent}>|</span> 발령 유형 *
              </h4>
              <div className={styles.inputBox}>
                <select
                  required
                  value={formData.appointmentTypeCode}
                  onChange={e => setFormData({...formData, appointmentTypeCode: e.target.value})}
                >
                  {appointmentTypes.map(type => (
                    <option key={type.code} value={type.code}>{type.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className={styles.formGridTwo}>
              <div className={styles.formSection}>
                <h4 className={styles.sectionTitle}>
                  <span className={styles.barAccent}>|</span> 변경 후 부서
                </h4>
                <div className={styles.inputBox}>
                  <select 
                    value={formData.afterDepartmentId || ""}
                    onChange={e => setFormData({...formData, afterDepartmentId: e.target.value ? Number(e.target.value) : null})}>
                    <option value="">변경 안함</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={styles.formSection}>
                <h4 className={styles.sectionTitle}>
                  <span className={styles.barAccent}>|</span> 변경 후 직급
                </h4>
                <div className={styles.inputBox}>
                  <select 
                    value={formData.afterPositionCode || ""}
                    onChange={e => setFormData({...formData, afterPositionCode: e.target.value || null})}>
                    <option value="">변경 안함</option>
                    {positions.map(pos => (
                      <option key={pos.code} value={pos.code}>{pos.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.formGridTwo}>
              <div className={styles.formSection}>
                <h4 className={styles.sectionTitle}>
                  <span className={styles.barAccent}>|</span> 변경 후 호봉
                </h4>
                <div className={styles.inputBox}>
                  <input
                    type="number"
                    min="1"
                    placeholder="변경 시 입력"
                    value={formData.afterPayStep || ""}
                    onChange={e => setFormData({...formData, afterPayStep: e.target.value ? Number(e.target.value) : null})}
                  />
                </div>
              </div>
              <div className={styles.formSection}>
                <h4 className={styles.sectionTitle}>
                  <span className={styles.barAccent}>|</span> 발령 적용일 *
                </h4>
                <div className={styles.inputBox}>
                  <input 
                    required
                    type="date" 
                    value={formData.applyDate}
                    onChange={e => setFormData({...formData, applyDate: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h4 className={styles.sectionTitle}>
                <span className={styles.barAccent}>|</span> 비고
              </h4>
              <div className={styles.inputBox}>
                <input 
                  type="text" 
                  placeholder="발령 사유 등 메모"
                  value={formData.note}
                  onChange={e => setFormData({...formData, note: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>취소</button>
            <button type="submit" className={styles.submitBtn}>
              등록 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

