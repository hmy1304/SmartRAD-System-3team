"use client";

import { useEffect, useState } from "react";
import styles from "./RoleManagementPage.module.scss";
import {
  RoleGroupResponse,
  RolePermissionResponse,
  RolePermissionUpdateRequest,
} from "@/types/system";

import DashboardSidebar from "../DashboardSidebar/DashboardSidebar";
import layoutStyles from "../DashboardPage/DashboardPage.module.scss";
import {
  getRoleGroups,
  getRolePermissions,
  updateRolePermission,
  getDepartments,
  deleteRoleGroup,
  createRoleGroup,
} from "@/services/systemService";
import type { DepartmentResponse } from "@/types/system";
import {
  getEmployees,
  updateEmployeeRole,
  updateAccountStatus,
  issueAccount,
  createEmployeeDetailed,
  deleteEmployees,
  CreateEmployeeRequest,
} from "@/services/employeeService";
import type { EmployeeSummaryResponse } from "@/types/employee";

import {
  Search,
  Key,
  Lock,
  Unlock,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  Crown,
  User,
  Shield,
  Calendar,
  FileText,
  Settings,
  Users,
  Umbrella,
  RotateCcw,
  MonitorPlay,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

type TabType = "EMPLOYEE" | "ROLE_GROUP";

const getIconForRole = (roleName: string) => {
  if (roleName.includes("시스템관리자") || roleName.includes("슈퍼")) return <Crown size={18} />;
  if (roleName.includes("관리자") || roleName.includes("부장")) return <User size={18} />;
  if (roleName.includes("수간호사")) return <User size={18} />;
  return <User size={18} />;
};

const getMenuIcon = (menuName: string) => {
  if (menuName.includes("듀티표")) return <Calendar size={18} />;
  if (menuName.includes("결재") || menuName.includes("기안")) return <FileText size={18} />;
  if (menuName.includes("권한") || menuName.includes("공통") || menuName.includes("시스템")) return <Settings size={18} />;
  if (menuName.includes("직원") || menuName.includes("조직") || menuName.includes("인사")) return <Users size={18} />;
  if (menuName.includes("휴가") || menuName.includes("근태") || menuName.includes("출퇴근")) return <Umbrella size={18} />;
  if (menuName.includes("급여") || menuName.includes("법정") || menuName.includes("마감")) return <Shield size={18} />;
  return <FileText size={18} />;
};

const getRoleBadgeStyle = (roleName: string) => {
  if (roleName.includes("관리자") || roleName.includes("수퍼")) return styles.badgePurple;
  if (roleName.includes("간호부장") || roleName.includes("부서")) return styles.badgeGreen;
  if (roleName.includes("수간호사") || roleName.includes("수석")) return styles.badgeBlue;
  return styles.badgeGrey;
};

export default function RoleManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>("EMPLOYEE");
  const [canEdit, setCanEdit] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState<number | null>(null);

  // 권한 체크 로직 추가
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('userProfile');
      if (userStr) {
        const user = JSON.parse(userStr);
        let hasAccess = false;
        
        if (user.employeeId) {
          setLoggedInUserId(user.employeeId);
        }

        // 📌 마스터 권한은 오직 ADMIN-001(최고관리자)에 한정. ADMIN-002 등 시스템 관리자는 일반 DB 체크박스 통제 적용.
        const isAdminRole = user.empNo === 'ADMIN-001' || user.roleGroupName === '최고관리자';

        if (isAdminRole) {
          hasAccess = true;
          setCanEdit(true);
        } else if (user.permissions && Array.isArray(user.permissions)) {
          const sysPerm = user.permissions.find((p: any) => p.menuCode === 'SYSTEM_ROLES' || p.menuCode === 'SYSTEM_ADMIN');
          if (sysPerm && sysPerm.canRead) {
            hasAccess = true;
            setCanEdit(!!sysPerm.canWrite);
          }
        }

        if (!hasAccess) {
          alert('시스템 관리자 메뉴에 대한 조회 권한이 없습니다.');
          window.location.href = '/dashboard';
        }
      } else {
        window.location.href = '/login';
      }
    } catch (e) {
      console.error(e);
      window.location.href = '/login';
    }
  }, []);

  // 권한 그룹 관련 State
  const [roleGroups, setRoleGroups] = useState<RoleGroupResponse[]>([]);
  const [selectedRoleGroupId, setSelectedRoleGroupId] = useState<number | null>(null);
  const [permissions, setPermissions] = useState<RolePermissionResponse[]>([]);

  // 직원 관련 State
  const [employees, setEmployees] = useState<EmployeeSummaryResponse[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("");
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);

  // 직원 초대  // Modals
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  const [newEmployee, setNewEmployee] = useState<CreateEmployeeRequest>({
    empNo: "",
    name: "",
    email: "",
    joinDate: new Date().toISOString().split("T")[0],
    departmentId: 0,
    roleGroupId: undefined,
  });

  useEffect(() => {
    fetchRoleGroups();
    fetchDepartments();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEmployees();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchKeyword, selectedDept, selectedRoleFilter]);

  useEffect(() => {
    if (selectedRoleGroupId) {
      fetchPermissions(selectedRoleGroupId);
    }
  }, [selectedRoleGroupId]);

  const fetchRoleGroups = async () => {
    try {
      const data = await getRoleGroups();
      setRoleGroups(data);
      if (data.length > 0 && !selectedRoleGroupId) {
        setSelectedRoleGroupId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPermissions = async (id: number) => {
    try {
      const data = await getRolePermissions(id);
      setPermissions(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await getEmployees(50, searchKeyword, selectedDept, selectedRoleFilter);
      setEmployees(data.content || []);
    } catch (e) {
      console.error("Employee fetch err", e);
    }
  };

  const handleRoleChange = async (employeeId: number, roleGroupId: number) => {
    try {
      await updateEmployeeRole(employeeId, roleGroupId);
      alert("권한 그룹이 성공적으로 변경되었습니다.");
      loadEmployees();
    } catch (e) {
      console.error(e);
      alert("권한 그룹 변경에 실패했습니다. 시스템 관리자는 변경할 수 없거나 서버 오류입니다.");
    }
  };

  const handleIssueAccount = async (employeeId: number) => {
    if (!confirm("이 직원의 계정을 발급(비밀번호 초기화) 하시겠습니까?")) return;
    try {
      const res = await issueAccount(employeeId);
      alert(`계정이 발급되었습니다.\n사번: ${res.empNo}\n임시비밀번호: ${res.temporaryPassword || "1234"}`);
    } catch (e) {
      console.error(e);
      alert("계정 발급에 실패했습니다.");
    }
  };

  const handleStatusToggle = async (employeeId: number, currentStatus: string) => {
    if (loggedInUserId && Number(employeeId) === Number(loggedInUserId)) {
      alert("본인의 계정 상태는 변경할 수 없습니다.");
      return;
    }
    try {
      const newStatus = currentStatus === "ACTIVE" ? "LOCKED" : "ACTIVE";
      await updateAccountStatus(employeeId, newStatus);
      loadEmployees();
    } catch (e) {
      console.error(e);
    }
  };

  const handlePermissionChange = (
    menuId: number,
    field: keyof RolePermissionUpdateRequest,
    value: boolean
  ) => {
    setPermissions((prev) =>
      prev.map((p) => {
        if (p.menuId === menuId) {
          const newP = { ...p, [field]: value };
          // 다른 권한(Write, Delete, Approve)을 켤 때 조회 권한이 없으면 자동으로 켬
          if (field !== "canRead" && value === true) {
            newP.canRead = true;
          }
          // 조회 권한을 끌 때 다른 모든 권한도 함께 끔
          if (field === "canRead" && value === false) {
            newP.canWrite = false;
            newP.canDelete = false;
            newP.canApprove = false;
          }
          return newP;
        }
        return p;
      })
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedRoleGroupId) return;
    try {
      for (const p of permissions) {
        const req: RolePermissionUpdateRequest = {
          canRead: p.canRead,
          canWrite: p.canWrite,
          canDelete: p.canDelete,
          canApprove: p.canApprove,
        };
        await updateRolePermission(selectedRoleGroupId, p.menuId, req);
      }
      alert("저장되었습니다.");
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetPermissions = async () => {
    if (!selectedRoleGroupId) return;
    if (!confirm("현재 변경된 권한 설정들을 저장된 원본 상태로 초기화하시겠습니까?")) return;
    try {
      const perms = await getRolePermissions(selectedRoleGroupId);
      setPermissions(perms);
      alert("권한 설정이 원래대로 초기화되었습니다.");
    } catch (e) {
      console.error(e);
      alert("초기화 실패");
    }
  };

  const handleCreateRoleGroup = async () => {
    if (!canEdit) {
      alert("수정 권한이 없습니다.");
      return;
    }
    const name = prompt("새로운 권한 그룹의 이름을 입력하세요 (예: 수석 전공의, 안전관리팀):");
    if (!name || !name.trim()) return;
    const description = prompt("해당 권한 그룹에 대한 간단한 설명을 입력하세요:") || "신규 권한 그룹";
    try {
      await createRoleGroup({ name: name.trim(), description: description.trim() });
      alert("새 권한 그룹이 성공적으로 신설되었습니다.");
      await fetchRoleGroups();
    } catch (e) {
      console.error(e);
      alert("권한 그룹 생성에 실패했습니다.");
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (newEmployee.departmentId === 0) {
        alert("부서를 선택해주세요.");
        return;
      }
      await createEmployeeDetailed(newEmployee as CreateEmployeeRequest);
      alert("새 직원이 초대(등록)되었습니다.");
      setIsInviteModalOpen(false);
      setNewEmployee({
        empNo: "",
        name: "",
        email: "",
        joinDate: new Date().toISOString().split("T")[0],
        departmentId: 0,
        roleGroupId: undefined,
      });
      loadEmployees();
    } catch (e) {
      console.error(e);
      alert("직원 초대에 실패했습니다. 사번 중복 등을 확인하세요.");
    }
  };

  const handleDeleteEmployees = async () => {
    if (selectedEmployeeIds.length === 0) {
      alert("삭제할 직원을 선택해주세요.");
      return;
    }
    if (confirm(`선택한 ${selectedEmployeeIds.length}명의 직원을 정말 삭제하시겠습니까?`)) {
      try {
        await deleteEmployees(selectedEmployeeIds);
        alert("성공적으로 삭제되었습니다.");
        setSelectedEmployeeIds([]);
        loadEmployees();
      } catch (e) {
        console.error(e);
        alert("삭제에 실패했습니다.");
      }
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedEmployeeIds(employees.map(emp => emp.id));
    } else {
      setSelectedEmployeeIds([]);
    }
  };

  const handleSelectEmployee = (id: number) => {
    setSelectedEmployeeIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDeleteRoleGroup = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm("정말 이 권한 그룹을 삭제하시겠습니까? 관련된 권한 설정도 모두 삭제됩니다.")) {
      try {
        await deleteRoleGroup(id);
        alert("권한 그룹이 삭제되었습니다.");
        if (selectedRoleGroupId === id) {
          setSelectedRoleGroupId(null);
          setPermissions([]);
        }
        fetchRoleGroups();
      } catch (e) {
        console.error(e);
        alert("권한 그룹 삭제에 실패했습니다.");
      }
    }
  };

  // 날짜 포맷 (임시)
  const lastSavedDate = "2026. 07. 11 오전 10:32";

  return (
    <>
        <div className={styles.container}>
          <header className={styles.header}>
            <div className={styles.brand}>SMART HOSPITAL HR</div>
            <h1>사용자·권한 관리</h1>
            <p>직원 계정을 관리하고 시스템 접근 권한을 설정합니다.</p>
          </header>

          <div className={styles.tabs}>
            <button
              className={activeTab === "EMPLOYEE" ? styles.active : ""}
              onClick={() => setActiveTab("EMPLOYEE")}
            >
              직원 계정 목록
            </button>
            <button
              className={activeTab === "ROLE_GROUP" ? styles.active : ""}
              onClick={() => setActiveTab("ROLE_GROUP")}
            >
              권한 그룹 설정
            </button>
          </div>

          <div className={styles.contentArea}>
            {activeTab === "EMPLOYEE" && (
              <>
                <div className={styles.toolbar}>
                  <div className={styles.titleSection}>
                    <div className={styles.breadcrumb}>
                      <Settings size={14} /> &gt; 시스템 관리 &gt; <span className={styles.currentCrumb}>직원 계정 목록</span>
                    </div>
                    <h2>직원 계정 목록 및 그룹 권한 부여</h2>
                  </div>
                  <div className={styles.btnGroup}>
                    <button 
                      className={`${styles.outlineBtn} ${styles.dangerBtn}`} 
                      onClick={handleDeleteEmployees}
                      disabled={selectedEmployeeIds.length === 0 || !canEdit}
                    >
                      <Trash2 size={16} /> 직원 삭제
                    </button>
                    <button 
                      className={styles.primaryBtn} 
                      onClick={() => setIsInviteModalOpen(true)}
                      disabled={!canEdit}
                      style={{ opacity: canEdit ? 1 : 0.4, cursor: canEdit ? 'pointer' : 'not-allowed' }}
                      title={!canEdit ? "수정 권한이 없습니다" : "새로운 직원을 초대합니다"}
                    >
                      + 직원 초대
                    </button>
                  </div>
                </div>

                <div className={styles.filterBar}>
                  <div className={styles.searchWrap}>
                    <Search size={16} color="#94a3b8" />
                    <input 
                      type="text" 
                      placeholder="이름 또는 사번으로 검색" 
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                    />
                  </div>
                  <div className={styles.selectWrap}>
                    <select
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                    >
                      <option value="">부서 전체</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.selectWrap}>
                    <select
                      value={selectedRoleFilter}
                      onChange={(e) => setSelectedRoleFilter(e.target.value)}
                    >
                      <option value="">시스템 권한 전체</option>
                      {roleGroups.map((rg) => (
                        <option key={rg.id} value={rg.id}>{rg.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.totalBadge}>
                    전체 직원 {employees.length.toLocaleString()}명
                  </div>
                </div>

                <div className={styles.tableContainer}>
                  <table>
                    <thead>
                      <tr>
                        <th style={{ width: '40px', textAlign: 'center' }}>
                          <input 
                            type="checkbox" 
                            checked={employees.length > 0 && selectedEmployeeIds.length === employees.length}
                            onChange={handleSelectAll}
                          />
                        </th>
                        <th>이름 / 사번</th>
                        <th>부서</th>
                        <th>분류</th>
                        <th>상태</th>
                        <th>관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((emp) => (
                        <tr key={emp.id}>
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="checkbox" 
                              checked={selectedEmployeeIds.includes(emp.id)}
                              onChange={() => handleSelectEmployee(emp.id)}
                            />
                          </td>
                          <td>
                            <div className={styles.empInfo}>
                              <div className={styles.avatar} style={{ backgroundColor: "#e0e7ff", color: "#4f46e5" }}>
                                {emp.name.substring(0, 1)}
                              </div>
                              <div className={styles.details}>
                                <span className={styles.name}>{emp.name}</span>
                                <span className={styles.position}>{emp.positionName || emp.roleGroupName}</span>
                              </div>
                            </div>
                          </td>
                          <td className={styles.department}>{emp.departmentName || "-"}</td>
                          <td>
                            <div className={styles.roleSelectWrapper}>
                              <div className={`${styles.roleDot} ${(emp.roleGroupName || "").includes("수석") ? styles.dotBlue : (emp.roleGroupName || "").includes("일반") ? styles.dotGrey : (emp.roleGroupName || "").includes("시스템") ? styles.dotPurple : styles.dotYellow}`}></div>
                                <select
                                  className={styles.roleSelect}
                                  value={roleGroups.find(rg => rg.name === emp.roleGroupName)?.id || ""}
                                  disabled={!canEdit}
                                  style={{ opacity: canEdit ? 1 : 0.6, cursor: canEdit ? 'pointer' : 'not-allowed' }}
                                  onChange={(e) => handleRoleChange(emp.id, Number(e.target.value))}
                                >
                                  {roleGroups.map((rg) => (
                                    <option key={rg.id} value={rg.id}>
                                      {rg.name}
                                    </option>
                                  ))}
                                </select>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`${styles.statusBadge} ${
                                emp.accountStatus === "ACTIVE"
                                  ? styles.active
                                  : styles.locked
                              }`}
                            >
                              {emp.accountStatus === "ACTIVE" ? "활성" : "잠금"}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div className={styles.actionButtons}>
                              <button 
                                className={styles.iconBtn} 
                                onClick={() => handleIssueAccount(emp.id)}
                                disabled={!canEdit}
                                style={{ opacity: canEdit ? 1 : 0.4, cursor: canEdit ? 'pointer' : 'not-allowed' }}
                                title={!canEdit ? "수정 권한이 없습니다" : "비밀번호 초기화"}
                              >
                                <Key size={16} />
                              </button>
                              <button
                                className={`${styles.iconBtn} ${emp.accountStatus === "LOCKED" ? styles.lockedBtn : ""}`}
                                onClick={() => handleStatusToggle(emp.id, emp.accountStatus)}
                                disabled={!canEdit}
                                title={emp.id === loggedInUserId ? "본인 계정은 잠글 수 없습니다" : "계정 상태 변경"}
                              >
                                {emp.accountStatus === "ACTIVE" ? <Unlock size={16} /> : <Lock size={16} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className={styles.paginationRow}>
                  <span className={styles.pageInfo}>
                    총 {employees.length.toLocaleString()}명 중 {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                    {Math.min(currentPage * ITEMS_PER_PAGE, employees.length)}명 표시
                  </span>
                  <div className={styles.pagination}>
                    <button 
                      className={styles.pageNav} 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: Math.ceil(employees.length / ITEMS_PER_PAGE) || 1 }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        className={`${styles.pageNum} ${currentPage === pageNum ? styles.active : ""}`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    ))}
                    <button 
                      className={styles.pageNav} 
                      onClick={() => setCurrentPage(prev => Math.min(Math.ceil(employees.length / ITEMS_PER_PAGE) || 1, prev + 1))}
                      disabled={currentPage === (Math.ceil(employees.length / ITEMS_PER_PAGE) || 1)}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === "ROLE_GROUP" && (
              <>
                <div className={styles.toolbar}>
                  <div className={styles.titleSection}>
                    <div className={styles.breadcrumb}>
                      <Settings size={14} /> &gt; 시스템 관리 &gt; <span className={styles.currentCrumb}>권한 설정</span>
                    </div>
                    <h2>권한 그룹 및 메뉴 권한 설정</h2>
                  </div>
                  <button className={styles.primaryBtn} onClick={handleCreateRoleGroup} disabled={!canEdit}>+ 새 권한 그룹 만들기</button>
                </div>
                
                <div className={styles.splitLayout}>
                  {/* 좌측: 권한 그룹 목록 */}
                  <div className={styles.leftPanel}>
                    <div className={styles.panelHeader}>
                      <div className={styles.panelTitleWrap}>
                        <Shield size={18} color="#2563eb" />
                        <h3>권한 그룹 목록</h3>
                      </div>
                      <span className={styles.groupCount}>{roleGroups.length}개 그룹</span>
                    </div>
                    
                    <div className={styles.searchBox}>
                      <Search size={16} color="#94a3b8" />
                      <input type="text" placeholder="권한 그룹 검색..." />
                    </div>

                    <div className={styles.groupList}>
                      {roleGroups.map((rg) => (
                        <div
                          key={rg.id}
                          className={`${styles.groupCard} ${
                            selectedRoleGroupId === rg.id ? styles.active : ""
                          }`}
                          onClick={() => setSelectedRoleGroupId(rg.id)}
                        >
                          <div className={`${styles.iconBox} ${getRoleBadgeStyle(rg.name)}`}>
                            {getIconForRole(rg.name)}
                          </div>
                          <div className={styles.info}>
                            <h4>{rg.name}</h4>
                            <p>{rg.description}</p>
                          </div>
                          <div className={`${styles.roleBadge} ${getRoleBadgeStyle(rg.name)}`}>
                            {rg.name.includes("관리자") ? "전체 권한" : rg.name.includes("부장") ? "부서 관리자" : "기본 권한"}
                          </div>
                          <button 
                            className={styles.deleteGroupBtn}
                            onClick={(e) => handleDeleteRoleGroup(e, rg.id)}
                            disabled={!canEdit}
                            style={{ opacity: canEdit ? 1 : 0.4, cursor: canEdit ? 'pointer' : 'not-allowed' }}
                            title={!canEdit ? "수정 권한이 없습니다" : "이 권한 그룹 삭제"}
                          >
                            <Trash2 size={14} />
                          </button>
                          {selectedRoleGroupId === rg.id && (
                            <div className={styles.activeIndicator}>
                              <div className={styles.dot}></div>
                              <ChevronRight size={16} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 우측: 권한 설정 테이블 */}
                  <div className={styles.rightPanel}>
                    <div className={styles.panelHeaderRight}>
                      <div className={styles.titleArea}>
                        <div className={styles.currentSelectionBadge}>
                          <div className={styles.dot}></div>
                          현재 선택: {roleGroups.find((rg) => rg.id === selectedRoleGroupId)?.name}
                        </div>
                        <h3>{roleGroups.find((rg) => rg.id === selectedRoleGroupId)?.name} 상세 권한 설정</h3>
                        <p>아래 체크박스를 통해 각 메뉴별 접근 권한을 세밀하게 설정하세요.</p>
                      </div>
                      <div className={styles.rightActionBtns}>
                        <button className={styles.outlineBtn} disabled={!canEdit} onClick={handleResetPermissions}><RotateCcw size={16} /> 초기화</button>
                        <button className={styles.outlineBtn} disabled={!canEdit}><MonitorPlay size={16} /> 미리보기</button>
                      </div>
                    </div>

                    <div className={styles.permissionsTable}>
                      <table>
                        <thead>
                          <tr>
                            <th>메뉴명</th>
                            <th>
                              <div className={styles.thContent}>
                                <Eye size={16} color="#3b82f6" />
                                <span>조회 (Read)</span>
                              </div>
                            </th>
                            <th>
                              <div className={styles.thContent}>
                                <Edit2 size={16} color="#22c55e" />
                                <span>수정 (Write)</span>
                              </div>
                            </th>
                            <th>
                              <div className={styles.thContent}>
                                <Trash2 size={16} color="#ef4444" />
                                <span>삭제 (Delete)</span>
                              </div>
                            </th>
                            <th>
                              <div className={styles.thContent}>
                                <CheckCircle size={16} color="#f97316" />
                                <span>결재 (Approve)</span>
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {permissions.map((p) => {
                            const isRootRole = roleGroups.find((rg) => rg.id === selectedRoleGroupId)?.name === '최고관리자';
                            return (
                            <tr key={p.id}>
                              <td>
                                <div className={styles.menuName}>
                                  <div className={`${styles.menuIcon} ${
                                    p.menuName.includes("듀티표") ? styles.iconBlue :
                                    p.menuName.includes("전자결재") ? styles.iconGreen :
                                    p.menuName.includes("시스템") ? styles.iconRed :
                                    p.menuName.includes("인사") ? styles.iconYellow : styles.iconGreen
                                  }`}>
                                    {getMenuIcon(p.menuName)}
                                  </div>
                                  <div className={styles.menuText}>
                                    <p className={styles.title}>{p.menuName} {isRootRole && <span style={{fontSize: "11px", color: "#ef4444"}}>(고정)</span>}</p>
                                    <p className={styles.desc}>{p.menuCode}</p>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <label className={styles.customCheckbox} style={{opacity: isRootRole ? 0.6 : 1, cursor: isRootRole ? "not-allowed" : "pointer"}}>
                                  <input
                                    type="checkbox"
                                    checked={p.canRead || isRootRole}
                                    disabled={isRootRole || !canEdit}
                                    onChange={(e) =>
                                      handlePermissionChange(p.menuId, "canRead", e.target.checked)
                                    }
                                  />
                                  <span className={styles.checkmark}></span>
                                </label>
                              </td>
                              <td>
                                <label className={styles.customCheckbox} style={{opacity: isRootRole ? 0.6 : 1, cursor: isRootRole ? "not-allowed" : "pointer"}}>
                                  <input
                                    type="checkbox"
                                    checked={p.canWrite || isRootRole}
                                    disabled={isRootRole || !canEdit}
                                    onChange={(e) =>
                                      handlePermissionChange(p.menuId, "canWrite", e.target.checked)
                                    }
                                  />
                                  <span className={styles.checkmark}></span>
                                </label>
                              </td>
                              <td>
                                <label className={styles.customCheckbox} style={{opacity: isRootRole ? 0.6 : 1, cursor: isRootRole ? "not-allowed" : "pointer"}}>
                                  <input
                                    type="checkbox"
                                    checked={p.canDelete || isRootRole}
                                    disabled={isRootRole || !canEdit}
                                    onChange={(e) =>
                                      handlePermissionChange(p.menuId, "canDelete", e.target.checked)
                                    }
                                  />
                                  <span className={styles.checkmark}></span>
                                </label>
                              </td>
                              <td>
                                <label className={styles.customCheckbox} style={{opacity: isRootRole ? 0.6 : 1, cursor: isRootRole ? "not-allowed" : "pointer"}}>
                                  <input
                                    type="checkbox"
                                    checked={p.canApprove || isRootRole}
                                    disabled={isRootRole || !canEdit}
                                    onChange={(e) =>
                                      handlePermissionChange(p.menuId, "canApprove", e.target.checked)
                                    }
                                  />
                                  <span className={`${styles.checkmark} ${styles.orange}`}></span>
                                </label>
                              </td>
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      
                      <div className={styles.tableFooter}>
                        <div className={styles.infoText}>
                          <span className={styles.infoIcon}>i</span>
                          총 {permissions.length}개 메뉴에 대해 {permissions.reduce((acc, p) => acc + (p.canRead ? 1 : 0) + (p.canWrite ? 1 : 0) + (p.canDelete ? 1 : 0) + (p.canApprove ? 1 : 0), 0)}개의 세부 권한이 부여되어 있습니다.
                        </div>
                        <div className={styles.selectAll}>
                          <span>전체 선택</span>
                          <label className={styles.customCheckbox}>
                            <input type="checkbox" />
                            <span className={styles.checkmark}></span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className={styles.actionFooter}>
                      <div className={styles.lastSaved}>
                        <RotateCcw size={14} />
                        마지막 저장: {lastSavedDate}
                      </div>
                      <div className={styles.buttons}>
                        <button
                          className={styles.cancelBtn}
                          onClick={() => selectedRoleGroupId && fetchPermissions(selectedRoleGroupId)}
                          disabled={!canEdit}
                        >
                          취소
                        </button>
                        <button className={styles.saveBtn} onClick={handleSavePermissions} disabled={!canEdit}>
                          <FileText size={16} /> 저장하기
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

      {isInviteModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>신규 직원 초대</h3>
              <button className={styles.closeBtn} onClick={() => setIsInviteModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleInviteSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>사번 *</label>
                  <input 
                    type="text" 
                    required 
                    value={newEmployee.empNo} 
                    onChange={e => setNewEmployee({...newEmployee, empNo: e.target.value})} 
                    placeholder="예: RN-9999" 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>이름 *</label>
                  <input 
                    type="text" 
                    required 
                    value={newEmployee.name} 
                    onChange={e => setNewEmployee({...newEmployee, name: e.target.value})} 
                    placeholder="이름 입력" 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>이메일</label>
                  <input 
                    type="email" 
                    value={newEmployee.email} 
                    onChange={e => setNewEmployee({...newEmployee, email: e.target.value})} 
                    placeholder="example@hospital.com" 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>입사일 *</label>
                  <input 
                    type="date" 
                    required 
                    value={newEmployee.joinDate} 
                    onChange={e => setNewEmployee({...newEmployee, joinDate: e.target.value})} 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>부서 *</label>
                  <select
                    required
                    value={newEmployee.departmentId || ""}
                    onChange={e => setNewEmployee({...newEmployee, departmentId: Number(e.target.value)})}
                  >
                    <option value="" disabled>부서 선택</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>권한 그룹</label>
                  <select 
                    value={newEmployee.roleGroupId || ""} 
                    onChange={e => setNewEmployee({...newEmployee, roleGroupId: e.target.value ? Number(e.target.value) : undefined})}
                  >
                    <option value="">(선택 안함)</option>
                    {roleGroups.map(rg => <option key={rg.id} value={rg.id}>{rg.name}</option>)}
                  </select>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsInviteModalOpen(false)}>취소</button>
                <button type="submit" className={styles.saveBtn}>초대하기</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
