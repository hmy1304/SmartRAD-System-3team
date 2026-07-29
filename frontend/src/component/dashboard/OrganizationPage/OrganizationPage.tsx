"use client";

import { useState, useEffect } from "react";
import styles from "./OrganizationPage.module.scss";
import DepartmentModal, { DepartmentTreeData } from "./DepartmentModal";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OrganizationPage() {
  const router = useRouter();
  const [treeData, setTreeData] = useState<DepartmentTreeData[]>([]);
  const [flatDepts, setFlatDepts] = useState<DepartmentTreeData[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const [deptKeyword, setDeptKeyword] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editDeptData, setEditDeptData] = useState<DepartmentTreeData | null>(null);

  const [isAdmin, setIsAdmin] = useState(false);

  // 데이터 로드
  const fetchData = async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
      };

      // 1. 트리 데이터
      const treeRes = await fetch("/api-system/departments/tree", { headers });
      const treeJson = await treeRes.json();
      setTreeData(treeJson);

      // 2. 평면 부서 데이터 (검색 및 리스트용)
      const deptRes = await fetch("/api-system/departments", { headers });
      const deptJson = await deptRes.json();
      setFlatDepts(deptJson);
      
      if (!selectedDeptId && deptJson.length > 0) {
        // 초기 선택: 병원장(ID: 1) 말고 일반 부서 선택을 선호하지만, 
        // 그냥 리스트의 첫번째(혹은 트리 최상단) 선택
        setSelectedDeptId(deptJson[0].id);
      }

      // 3. 임직원 데이터 (부서장 선택용 및 목록용)
      // 백엔드가 Page 객체를 반환할 수 있으므로 content 배열을 추출합니다.
      const empRes = await fetch("/api-system/employees?size=500", { headers });
      const empJson = await empRes.json();
      setEmployees(empJson.content || empJson);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    }
  };

  useEffect(() => {
    // 권한 체크: LoginPage에서 저장한 userProfile을 읽어옵니다.
    const userStr = localStorage.getItem("userProfile");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.empNo === "ADMIN-001" || user.role === "ROLE_ADMIN" || user.roleGroupId === 1) {
        setIsAdmin(true);
      }
    }
    fetchData();
  }, []);

  // CRUD 핸들러
  const handleCreateOrUpdate = async (submitData: any) => {
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
      };

      if (editDeptData) {
        // 수정
        const res = await fetch(`/api-system/departments/${editDeptData.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(submitData)
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || errData.error || "수정 실패");
        }
      } else {
        // 등록
        const res = await fetch("/api-system/departments", {
          method: "POST",
          headers,
          body: JSON.stringify(submitData)
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || errData.error || "생성 실패");
        }
      }
      alert("정상적으로 처리되었습니다.");
      fetchData(); // 다이어그램 실시간 갱신!
    } catch (error: any) {
      console.error(error);
      alert(error.message || "오류가 발생했습니다.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 이 부서를 삭제하시겠습니까?")) return;
    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
      };
      const res = await fetch(`/api-system/departments/${id}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || "삭제 실패");
      }
      alert("부서가 삭제되었습니다.");
      setSelectedDeptId(flatDepts[0]?.id || null);
      fetchData();
    } catch (error) {
      console.error(error);
      alert("오류가 발생했습니다.");
    }
  };

  // 필터 및 선택된 부서 연산
  const filteredDepts = flatDepts.filter((d) => 
    d.name.toLowerCase().includes(deptKeyword.toLowerCase()) || 
    (d.nameEn && d.nameEn.toLowerCase().includes(deptKeyword.toLowerCase()))
  );
  
  const selectedDept = flatDepts.find(d => d.id === selectedDeptId);
  const selectedDeptMembers = employees.filter(e => e.departmentId === selectedDeptId);

  // 상단 요약 지표 동적 계산
  const totalDepts = flatDepts.length;
  // 트리 최상위(병원장)의 totalSubMemberCount + 본인 memberCount
  const rootDept = treeData.find(d => d.parentId === null || !d.parentId) || treeData[0];
  const totalMembers = rootDept ? rootDept.totalSubMemberCount : 0;
  // 부문(2depth) 수: rootDept의 children 개수
  const topDivisions = rootDept?.children?.length || 0;
  // 부서장 미배정 부서
  const noManagerDepts = flatDepts.filter(d => !d.managerId).length;

  const renderSubDepts = (dept: any) => {
    if (!dept.children || dept.children.length === 0) return null;
    return (
      <div className={styles.orgSubLevel}>
        <div className={styles.orgSubGroup}>
          {dept.children.map((child: any) => (
            <div key={child.id} className={styles.orgSubBranch}>
              <div 
                className={`${styles.orgNode} ${selectedDeptId === child.id ? styles.activeNode : ""}`}
                onClick={() => setSelectedDeptId(child.id)}
              >
                {child.name}<span>{child.totalSubMemberCount}명</span>
              </div>
              {renderSubDepts(child)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <main className={styles.main}>
      {/* 페이지 헤더 */}
      <div className={styles.pageHeader}>
        <div>
          <h1>조직관리</h1>
          <p>병원의 조직 구조와 부서별 정보를 조회하고 관리합니다.</p>
        </div>
        <div className={styles.pageActions}>
          <button type="button" className={styles.outlineBtn} onClick={() => window.print()}>
            조직도 인쇄
          </button>
          {isAdmin && (
            <button 
              type="button" 
              className={styles.primaryBtn} 
              onClick={() => {
                setEditDeptData(null);
                setIsModalOpen(true);
              }}
            >
              + 부서 등록
            </button>
          )}
        </div>
      </div>

      {/* 요약 카드 */}
      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIconBlue}>🏢</div>
          <div>
            <label>전체 부서 수</label>
            <p>{totalDepts}<span>개</span></p>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIconGreen}>👥</div>
          <div>
            <label>전체 소속 인원</label>
            <p>{totalMembers.toLocaleString()}<span>명</span></p>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIconOrange}>🏛</div>
          <div>
            <label>상위 부문 수</label>
            <p>{topDivisions}<span>개</span></p>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIconPurple}>⚠</div>
          <div>
            <label>부서장 미배정</label>
            <p>{noManagerDepts}<span>건</span></p>
          </div>
        </div>
      </div>

      {/* 전체 조직도 다이어그램 (동적 렌더링) */}
      <section className={styles.orgChartSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>전체 조직도</h2>
            <p>병원의 동적 계층 구조 다이어그램입니다.</p>
          </div>
          <div className={styles.legend}>
            <span><i className={styles.dotBlue} /> 병원장/루트</span>
            <span><i className={styles.dotGreen} /> 상위 부문</span>
            <span><i className={styles.dotGray} /> 개별 부서</span>
          </div>
        </div>

        <div className={styles.orgChart}>
          {rootDept && (
            <>
              {/* 1. 최상위(루트) */}
              <div className={styles.orgRoot}>
                <div 
                  className={`${styles.orgNodeRoot} ${selectedDeptId === rootDept.id ? styles.activeNode : ""}`}
                  onClick={() => setSelectedDeptId(rootDept.id)}
                >
                  {rootDept.name}<span>전체 {rootDept.totalSubMemberCount}명</span>
                </div>
              </div>
              <div className={styles.orgConnector} />
              
              {/* 2. 부문 (2depth) */}
              <div className={styles.orgLevel}>
                {rootDept.children?.map(division => (
                  <div key={division.id} className={styles.orgBranch}>
                    <div 
                      className={`${styles.orgNodeDept} ${selectedDeptId === division.id ? styles.activeNode : ""}`}
                      onClick={() => setSelectedDeptId(division.id)}
                    >
                      {division.name}<span>{division.totalSubMemberCount}명</span>
                    </div>
                    {/* 3. 하위 부서들 (무한 깊이 재귀 렌더링) */}
                    {renderSubDepts(division)}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* 하단: 부서 목록 + 상세 */}
      <div className={styles.bottomLayout}>
        {/* 좌측: 부서 목록 */}
        <section className={styles.deptListBox}>
          <div className={styles.deptListHeader}>
            <h3>부서 목록</h3>
            <div className={styles.deptSearch}>
              <input
                value={deptKeyword}
                onChange={(e) => setDeptKeyword(e.target.value)}
                placeholder="부서명으로 검색"
              />
            </div>
          </div>

          <div className={styles.deptList}>
            {filteredDepts.map((dept) => (
              <button
                key={dept.id}
                type="button"
                className={`${styles.deptItem} ${selectedDeptId === dept.id ? styles.deptItemActive : ""} ${!dept.parentId ? styles.deptParent : ""}`}
                onClick={() => setSelectedDeptId(dept.id)}
              >
                <span className={styles.deptName}>{dept.name}</span>
                <span className={styles.deptCount}>{dept.memberCount}명</span>
              </button>
            ))}
          </div>
        </section>

        {/* 우측: 부서 상세 */}
        <section className={styles.deptDetailBox}>
          {selectedDept ? (
            <>
              <div className={styles.deptDetailHeader}>
                <div className={styles.deptDetailTitle}>
                  <span className={styles.deptIcon}>🏥</span>
                  <div>
                    <h3>{selectedDept.name} {selectedDept.nameEn && <small style={{color:'#64748b', marginLeft:'4px'}}>{selectedDept.nameEn}</small>}</h3>
                    <p>{selectedDept.deptCode || "코드 미지정"} · {(selectedDept as any).parentName || "최상위 부서"}</p>
                  </div>
                </div>
                {isAdmin && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      type="button" 
                      className={styles.outlineBtn}
                      onClick={() => {
                        setEditDeptData(selectedDept as any);
                        setIsModalOpen(true);
                      }}
                    >
                      정보 수정
                    </button>
                    <button 
                      type="button" 
                      className={styles.outlineBtn}
                      style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                      onClick={() => handleDelete(selectedDept.id)}
                    >
                      🗑️ 삭제
                    </button>
                  </div>
                )}
              </div>

              <div className={styles.deptInfoGrid}>
                <div>
                  <label>상위 부서</label>
                  <p>{(selectedDept as any).parentName || "-"}</p>
                </div>
                <div>
                  <label>부서장</label>
                  <p>{selectedDept.managerName ? `${selectedDept.managerName} ${selectedDept.managerPosition || ""}` : "미지정"}</p>
                </div>
                <div>
                  <label>소속 인원 (본 부서)</label>
                  <p>{selectedDept.memberCount}명</p>
                </div>
                <div>
                  <label>설립일</label>
                  <p>{selectedDept.establishedDate || "-"}</p>
                </div>
                <div>
                  <label>위치</label>
                  <p>{selectedDept.location || "-"}</p>
                </div>
                <div>
                  <label>내선 번호</label>
                  <p>{selectedDept.phone || "-"}</p>
                </div>
              </div>

              <div className={styles.deptDesc}>
                <label>부서 설명</label>
                <p>{selectedDept.description || "등록된 부서 설명이 없습니다."}</p>
              </div>

              {/* 하위 조직 (자식이 있는 경우만) */}
              {(selectedDept as any).children && (selectedDept as any).children.length > 0 && (
                <div className={styles.deptChild}>
                  <label>하위 조직 ({(selectedDept as any).children.length})</label>
                  <div className={styles.childTags}>
                    {(selectedDept as any).children.map((c: any) => (
                      <span key={c.id} onClick={() => setSelectedDeptId(c.id)} style={{cursor: 'pointer'}}>{c.name}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* 소속 직원 목록 */}
              <div className={styles.memberSection}>
                <div className={styles.memberHeader}>
                  <h4>소속 직원 ({selectedDeptMembers.length}명)</h4>
                  <Link href={`/dashboard/employees?deptId=${selectedDept.id}`} className={styles.linkBtn}>
                    직원 관리에서 전체 보기 →
                  </Link>
                </div>

                <table className={styles.memberTable}>
                  <thead>
                    <tr>
                      <th>사번</th>
                      <th>이름</th>
                      <th>직위</th>
                      <th>직책/직무</th>
                      <th>재직상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDeptMembers.length > 0 ? (
                      selectedDeptMembers.map((m) => (
                        <tr key={m.id}>
                          <td>{m.empNo}</td>
                          <td>
                            <div className={styles.memberName}>
                              <span className={`${styles.memberAvatar} ${styles.blue}`}>
                                {m.name.charAt(0)}
                              </span>
                              {m.name}
                            </div>
                          </td>
                          <td>{m.positionName || "-"}</td>
                          <td>{m.jobCategoryName || "-"}</td>
                          <td>
                            <span className={`${styles.statusBadge} ${m.id === selectedDept.managerId ? styles.statusLeader : styles.active}`}>
                              {m.id === selectedDept.managerId ? "부서장" : m.accountStatus}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{textAlign: 'center', color: '#94a3b8'}}>소속 직원이 없습니다.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              선택된 부서가 없습니다.
            </div>
          )}
        </section>
      </div>

      <DepartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        editData={editDeptData}
        departments={flatDepts}
        employees={employees}
      />
    </main>
  );
}
