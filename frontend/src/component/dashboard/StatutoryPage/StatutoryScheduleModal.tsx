"use client";

import { useState } from "react";
import styles from "./StatutoryPage.module.scss";
import { createSchedule } from "@/services/statutoryService";
import type { StatutoryScheduleRequest } from "@/types/statutory";

export default function StatutoryScheduleModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState<StatutoryScheduleRequest>({
    title: "",
    agency: "4대보험 포털",
    category: "취득·상실",
    target: "고용보험",
    deadline: "",
    headCount: 1,
    estimatedAmount: 0,
    memo: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSchedule(formData);
    onSuccess();
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '500px', maxWidth: '90%' }}>
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#1e293b' }}>신고 일정 추가</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>신고 항목명</label>
            <input 
              required
              type="text" 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }} 
            />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>신고 기관</label>
              <select 
                value={formData.agency}
                onChange={e => setFormData({...formData, agency: e.target.value})}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                <option value="4대보험 포털">4대보험 포털</option>
                <option value="홈택스">홈택스</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>기한일</label>
              <input 
                required
                type="date" 
                value={formData.deadline}
                onChange={e => setFormData({...formData, deadline: e.target.value})}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }} 
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>유형</label>
            <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                <option value="취득·상실">취득·상실</option>
                <option value="원천징수">원천징수</option>
                <option value="보수월액 신고">보수월액 신고</option>
              </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.75rem', border: '1px solid #e2e8f0', background: 'white', borderRadius: '8px', cursor: 'pointer' }}>취소</button>
            <button type="submit" style={{ flex: 1, padding: '0.75rem', border: 'none', background: '#3b82f6', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>일정 등록</button>
          </div>
        </form>
      </div>
    </div>
  );
}
