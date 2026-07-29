"use client";

import { useMemo, useState, useEffect } from "react";

import styles from "./AppointmentPage.module.scss";

import AppointmentModal from "./AppointmentModal";
import { getAllAppointments } from "@/services/appointmentService";
import type { AppointmentResponse } from "@/services/appointmentService";

// For Modal dropdowns
interface Employee { id: number; empNo: string; name: string; departmentName: string; positionName: string; }
interface Department { id: number; name: string; }
interface CommonCode { code: string; name: string; }

type AppointmentStatus = "완료" | "처리중" | "대기";

interface AppointmentItem {
  id: string;
  type: string;
  name: string;
  initial: string;
  tone: "blue" | "green" | "purple" | "orange" | "red";
  fromDept: string;
  fromPosition: string;
  toDept: string;
  toPosition: string;
  date: string;
  status: AppointmentStatus;
}

const FILTERS = ["전체", "승진", "전보", "보직변경", "강등", "파견"] as const;

export default function AppointmentPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("전체");
  const [keyword, setKeyword] = useState("");
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // For modal data
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<CommonCode[]>([]);
  const [positions, setPositions] = useState<CommonCode[]>([]);

  const fetchAppointments = async () => {
    try {
      const data = await getAllAppointments();
      const mapped: AppointmentItem[] = data.map((a: AppointmentResponse) => {
        let status: AppointmentStatus = "대기";
        if (a.applied) {
          status = "완료";
        } else if (new Date(a.applyDate) <= new Date()) {
          status = "처리중";
        }
        
        // Random tone based on id
        const tones: ("blue" | "green" | "purple" | "orange" | "red")[] = ["blue", "green", "purple", "orange", "red"];
        const tone = tones[a.id % tones.length];

        return {
          id: `TR-2026-${String(a.id).padStart(3, '0')}`,
          type: a.appointmentTypeName,
          name: a.employeeName,
          initial: a.employeeName.charAt(0),
          tone,
          fromDept: a.beforeDepartmentName || "-",
          fromPosition: a.beforePositionName || "-",
          toDept: a.afterDepartmentName || "-",
          toPosition: a.afterPositionName || "-",
          date: a.applyDate.replace(/-/g, '.'),
          status
        };
      });
      setAppointments(mapped);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    }
  };

  const fetchModalData = async () => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
      };
      
      const [empRes, deptRes, codeRes] = await Promise.all([
        fetch('/api-system/employees', { headers }),
        fetch('/api-system/departments', { headers }),
        fetch('/common-codes', { headers })
      ]);
      if (empRes.ok) {
        const empData = await empRes.json();
        // Extract basic employee info from response (assuming it's a page or list)
        const emps = empData.content ? empData.content : empData;
        setEmployees(emps);
      }
      if (deptRes.ok) {
        setDepartments(await deptRes.json());
      }
      if (codeRes.ok) {
        const codes = await codeRes.json();
        setAppointmentTypes(codes.filter((c: any) => c.groupCode === 'APT'));
        setPositions(codes.filter((c: any) => c.groupCode === 'POS'));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchModalData();
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const filtered = useMemo(() => {
    return appointments.filter((item) => {
      const matchFilter = filter === "전체" || item.type === filter;
      const matchKeyword =
        !keyword ||
        item.name.includes(keyword) ||
        item.type.includes(keyword) ||
        item.id.toLowerCase().includes(keyword.toLowerCase());
      return matchFilter && matchKeyword;
    });
  }, [filter, keyword, appointments]);

  // Reset page to 1 when filter or keyword changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, keyword]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedAppointments = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Calculate stats for summary row
  const thisMonthCount = appointments.filter(a => a.date.startsWith("2026.07") || a.date.startsWith("2026.08")).length; // Assuming current month is 07 or 08
  const promoteCount = appointments.filter(a => a.type === "승진").length;
  const transferCount = appointments.filter(a => a.type === "전보").length;
  const roleChangeCount = appointments.filter(a => a.type === "보직변경").length;


  return (
    <main className={styles.main}>
          {/* 페이지 헤더 */}
          <div className={styles.pageHeader}>
            <div>
              <h1>인사발령 관리</h1>
              <p>직원의 부서 이동, 직책 변경, 승진 발령 내역을 관리합니다.</p>
            </div>
            <div className={styles.pageActions}>
              <button type="button" className={styles.outlineBtn}>
                내보내기
              </button>
              <button type="button" className={styles.primaryBtn} onClick={() => setIsModalOpen(true)}>
                + 발령 등록
              </button>
            </div>
          </div>

          {/* 요약 카드 */}
          <div className={styles.summaryRow}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIconBlue}>
                {/* 이번달 발령 - 원형 화살표 / 문서 */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17 1l4 4-4 4" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <path d="M7 23l-4-4 4-4" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
              </div>
              <div>
                <label>이번달 발령</label>
                <p>
                  {thisMonthCount}<span>건</span>
                </p>
              </div>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryIconGreen}>
                {/* 승진 발령 - 상승 차트 */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 17l6-6 4 4 8-8" />
                  <path d="M17 7h4v4" />
                </svg>
              </div>
              <div>
                <label>승진 발령</label>
                <p>
                  {promoteCount}<span>건</span>
                </p>
              </div>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryIconOrange}>
                {/* 전보 발령 - 오른쪽 화살표 */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14" />
                  <path d="M13 6l6 6-6 6" />
                </svg>
              </div>
              <div>
                <label>전보 발령</label>
                <p>
                  {transferCount}<span>건</span>
                </p>
              </div>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryIconPurple}>
                {/* 보직 변경 - 태그 */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </div>
              <div>
                <label>보직 변경</label>
                <p>
                  {roleChangeCount}<span>건</span>
                </p>
              </div>
            </div>
          </div>

          {/* 테이블 영역 */}
          <section className={styles.tableCard}>
            <div className={styles.tableToolbar}>
              <div className={styles.filterTabs}>
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={filter === f ? styles.filterActive : ""}
                    onClick={() => setFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className={styles.tableSearch}>
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="직원명·발령 유형 검색"
                />
              </div>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>발령번호</th>
                    <th>발령 유형</th>
                    <th>대상 직원</th>
                    <th>이전 부서/직위</th>
                    <th>변경 부서/직위</th>
                    <th>발령일</th>
                    <th>상태</th>
                    <th>처리</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAppointments.map((item) => (
                    <tr key={item.id}>
                      <td className={styles.idCell}>{item.id}</td>
                      <td>
                        <span
                          className={`${styles.typeBadge} ${
                            item.type === "승진"
                              ? styles.typePromote
                              : item.type === "전보"
                                ? styles.typeTransfer
                                : item.type === "강등"
                                  ? styles.typeDemote
                                  : item.type === "파견"
                                    ? styles.typeDispatch
                                    : styles.typePosition
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td>
                        <div className={styles.person}>
                          <span
                            className={`${styles.avatar} ${styles[item.tone]}`}
                          >
                            {item.initial}
                          </span>
                          {item.name}
                        </div>
                      </td>
                      <td>
                        {item.fromDept} / {item.fromPosition}
                      </td>
                      <td className={styles.toCell}>
                        {item.toDept} / {item.toPosition}
                      </td>
                      <td>{item.date}</td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            item.status === "완료"
                              ? styles.statusDone
                              : item.status === "처리중"
                                ? styles.statusProgress
                                : styles.statusWait
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <button type="button" className={styles.moreBtn}>
                          ···
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  className={`${styles.pageBtn} ${currentPage === pageNum ? styles.pageBtnActive : ""}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              ))}
              <button
                className={styles.pageBtn}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
            </div>
          </section>
          {isModalOpen && (
            <AppointmentModal
              employees={employees}
              departments={departments}
              appointmentTypes={appointmentTypes}
              positions={positions}
              onClose={() => setIsModalOpen(false)}
              onSuccess={() => {
                setIsModalOpen(false);
                fetchAppointments();
              }}
            />
          )}
        </main>
  );
}
