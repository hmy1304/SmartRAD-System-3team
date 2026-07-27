"use client";

import { useEffect, useState } from "react";
import type { DashboardData } from "@/types/dashboard";
import styles from "./CommonCodePage.module.scss";
import { fetchGroupCodes, fetchCommonCodes, CommonCode, createCommonCode, updateCommonCode } from "@/services/commonCodeService";

interface CommonCodePageProps {
  initialData: DashboardData;
}

export default function CommonCodePage({ initialData }: CommonCodePageProps) {
  const { profile } = initialData;
  const [groupCodes, setGroupCodes] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [codes, setCodes] = useState<CommonCode[]>([]);
  const [searchGroupQuery, setSearchGroupQuery] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<CommonCode | null>(null);

  // Fetch group codes on mount
  useEffect(() => {
    fetchGroupCodes()
      .then((res) => {
        setGroupCodes(res);
        if (res.length > 0) {
          setSelectedGroup(res[0]);
        }
      })
      .catch(console.error);
  }, []);

  // Fetch codes when selected group changes
  useEffect(() => {
    if (selectedGroup) {
      fetchCommonCodes(selectedGroup)
        .then(setCodes)
        .catch(console.error);
    }
  }, [selectedGroup]);

  const handleToggleActive = async (code: CommonCode) => {
    try {
      const updated = await updateCommonCode(code.code, {
        name: code.name,
        description: code.description,
        sortOrder: code.sortOrder,
        isActive: !code.isActive,
      });
      setCodes(codes.map(c => c.code === code.code ? updated : c));
    } catch (err) {
      console.error(err);
      alert("상태 변경에 실패했습니다.");
    }
  };

  const filteredGroups = groupCodes.filter(g => g.toLowerCase().includes(searchGroupQuery.toLowerCase()));

  return (
    <>

        {/* 본문 영역 */}
        <main className={styles.mainContent}>
          <div className={styles.pageHeader}>
            <p className={styles.subtitle}>SMART HOSPITAL HR</p>
            <h1 className={styles.title}>공통코드 관리</h1>
            <p className={styles.description}>시스템 전반에서 사용되는 공통 코드 항목을 관리합니다.</p>
          </div>

          <div className={styles.contentLayout}>
            {/* 좌측 패널 (그룹 목록) */}
            <aside className={styles.leftPanel}>
              <div className={styles.panelHeader}>
                <h2>코드 그룹</h2>
              </div>
              <div className={styles.groupSearch}>
                <label>
                  <span>⌕</span>
                  <input 
                    type="search" 
                    placeholder="그룹 검색..." 
                    value={searchGroupQuery}
                    onChange={(e) => setSearchGroupQuery(e.target.value)}
                  />
                </label>
              </div>
              <ul className={styles.groupList}>
                {filteredGroups.map(group => (
                  <li 
                    key={group} 
                    className={group === selectedGroup ? styles.active : ""}
                    onClick={() => setSelectedGroup(group)}
                  >
                    <div className={styles.groupIcon}>
                      <span>{group.charAt(0)}</span>
                    </div>
                    <div className={styles.groupInfo}>
                      <strong>{group}</strong>
                      <small>그룹 코드</small>
                    </div>
                    <span className={styles.arrow}>›</span>
                  </li>
                ))}
              </ul>
            </aside>

            {/* 우측 패널 (상세 목록) */}
            <section className={styles.rightPanel}>
              <div className={styles.panelHeader}>
                <div className={styles.breadcrumbs}>
                  <span>공통코드 관리</span> &gt; <strong>{selectedGroup}</strong>
                </div>
                <div className={styles.rightHeaderAction}>
                  <h2>{selectedGroup ? `${selectedGroup} 코드 목록` : "코드 목록"}</h2>
                  <button 
                    className={styles.btnAdd} 
                    onClick={() => { setEditingCode(null); setIsModalOpen(true); }}
                  >
                    + 코드 추가
                  </button>
                </div>
              </div>

              <div className={styles.tableWrapper}>
                <table className={styles.codeTable}>
                  <thead>
                    <tr>
                      <th>코드 ID</th>
                      <th>표시명</th>
                      <th>설명</th>
                      <th>활성화</th>
                      <th>수정</th>
                    </tr>
                  </thead>
                  <tbody>
                    {codes.map(code => (
                      <tr key={code.code}>
                        <td><span className={styles.badge}>{code.code}</span></td>
                        <td>
                          <div className={styles.codeName}>
                            <span className={styles.nameIcon}>🏷</span>
                            <strong>{code.name}</strong>
                          </div>
                        </td>
                        <td className={styles.textGray}>{code.description || "-"}</td>
                        <td>
                          <label className={styles.toggleSwitch}>
                            <input 
                              type="checkbox" 
                              checked={code.isActive} 
                              onChange={() => handleToggleActive(code)} 
                            />
                            <span className={styles.slider}></span>
                          </label>
                        </td>
                        <td>
                          <button 
                            className={styles.btnEdit}
                            onClick={() => { setEditingCode(code); setIsModalOpen(true); }}
                          >
                            ✎
                          </button>
                        </td>
                      </tr>
                    ))}
                    {codes.length === 0 && (
                      <tr>
                        <td colSpan={5} className={styles.emptyState}>등록된 공통 코드가 없습니다.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>

      {/* 모달 */}
      {isModalOpen && (
        <CommonCodeModal 
          initialGroupCode={selectedGroup}
          existingCode={editingCode}
          onClose={() => setIsModalOpen(false)}
          onSave={async (savedCode) => {
            // Re-fetch groups and codes
            const newGroups = await fetchGroupCodes();
            setGroupCodes(newGroups);
            const activeGroup = selectedGroup || savedCode.groupCode;
            setSelectedGroup(activeGroup);
            const updatedCodes = await fetchCommonCodes(activeGroup);
            setCodes(updatedCodes);
            setIsModalOpen(false);
          }}
        />
      )}
    </>
  );
}

// ---------------- CommonCodeModal 컴포넌트 ----------------
interface CommonCodeModalProps {
  initialGroupCode: string | null;
  existingCode: CommonCode | null;
  onClose: () => void;
  onSave: (code: CommonCode) => void;
}

function CommonCodeModal({ initialGroupCode, existingCode, onClose, onSave }: CommonCodeModalProps) {
  const [groupCode, setGroupCode] = useState(existingCode?.groupCode || initialGroupCode || "");
  const [code, setCode] = useState(existingCode?.code || "");
  const [name, setName] = useState(existingCode?.name || "");
  const [description, setDescription] = useState(existingCode?.description || "");
  const [isActive, setIsActive] = useState(existingCode ? existingCode.isActive : true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isGroupCodeDisabled = !!initialGroupCode || !!existingCode;

  const getPlaceholders = (gc: string) => {
    switch (gc) {
      case "APT": return { code: "예: APT_01", name: "예: 인사발령" };
      case "DOC_TYPE": return { code: "예: DOC_01", name: "예: 기안서" };
      case "EMP_STS": return { code: "예: STS_01", name: "예: 재직" };
      case "JOB": return { code: "예: JOB_004", name: "예: 임상병리사 (MT)" };
      case "LIC": return { code: "예: LIC_01", name: "예: 의사면허" };
      case "NOTICE": return { code: "예: NOT_01", name: "예: 전체공지" };
      case "POS": return { code: "예: POS_01", name: "예: 팀장" };
      case "SHIFT": return { code: "예: SHIFT_01", name: "예: 주간조" };
      default: return { 
        code: gc ? `예: ${gc}_01` : "예: JOB_004", 
        name: gc ? `예: ${gc} 관련 명칭` : "예: 임상병리사 (MT)" 
      };
    }
  };

  const placeholders = getPlaceholders(groupCode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupCode || !code || !name) {
      alert("필수 항목을 입력해주세요.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (existingCode) {
        const updated = await updateCommonCode(existingCode.code, {
          name, description, isActive, sortOrder: existingCode.sortOrder
        });
        onSave(updated);
      } else {
        const created = await createCommonCode({
          code, groupCode, name, description, sortOrder: 0
        });
        onSave(created);
      }
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>{existingCode ? "공통코드 수정" : "공통코드 추가"}</h3>
          <button className={styles.btnClose} onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label>코드 그룹 *</label>
            <input 
              type="text" 
              value={groupCode} 
              onChange={e => setGroupCode(e.target.value)}
              disabled={isGroupCodeDisabled} 
              className={isGroupCodeDisabled ? styles.inputDisabled : ""} 
              placeholder="예: 직종 분류"
            />
          </div>

          <div className={styles.formGroup}>
            <label>코드 ID *</label>
            <input 
              type="text" 
              value={code} 
              onChange={e => setCode(e.target.value)} 
              disabled={!!existingCode} 
              placeholder={placeholders.code}
            />
          </div>

          <div className={styles.formGroup}>
            <label>표시명 *</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder={placeholders.name}
            />
          </div>

          <div className={styles.formGroup}>
            <label>상세 설명</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="이 코드에 대한 설명을 입력하세요."
              rows={3}
            />
          </div>

          <div className={styles.formGroupHorizontal}>
            <div>
              <label>활성화 (사용 여부)</label>
              <small>이 코드를 시스템 전체에서 즉시 사용합니다.</small>
            </div>
            <label className={styles.toggleSwitch}>
              <input 
                type="checkbox" 
                checked={isActive} 
                onChange={e => setIsActive(e.target.checked)} 
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={styles.modalActions}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>취소</button>
            <button type="submit" className={styles.btnSave} disabled={isSubmitting}>
              {isSubmitting ? "저장 중..." : "저장하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
