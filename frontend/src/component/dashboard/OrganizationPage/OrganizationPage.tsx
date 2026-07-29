"use client";

import { useState } from "react";

import styles from "./OrganizationPage.module.scss";

const DEPARTMENTS = [
  { id: "1", name: "진료부문", count: 142, parent: true },
  { id: "2", name: "영상의학과", count: 42, parent: false, active: true },
  { id: "3", name: "진단검사의학과", count: 28, parent: false },
  { id: "4", name: "응급의학과", count: 20, parent: false },
  { id: "5", name: "약제부", count: 18, parent: false },
  { id: "6", name: "간호부문", count: 64, parent: true },
  { id: "7", name: "간호부", count: 89, parent: false },
  { id: "8", name: "감염관리실", count: 8, parent: false },
  { id: "9", name: "행정지원부문", count: 42, parent: true },
  { id: "10", name: "원무과", count: 24, parent: false },
  { id: "11", name: "인사총무팀", count: 12, parent: false },
  { id: "12", name: "시설관리팀", count: 9, parent: false },
];

const MEMBERS = [
  {
    no: "EMP-20191",
    name: "박서준",
    initial: "박",
    tone: "blue",
    rank: "부장",
    position: "수석 · 18호봉",
    status: "부서장",
  },
  {
    no: "EMP-20733",
    name: "오하윤",
    initial: "오",
    tone: "green",
    rank: "과장",
    position: "선임 · 12호봉",
    status: "재직",
  },
  {
    no: "EMP-21098",
    name: "신유나",
    initial: "신",
    tone: "purple",
    rank: "대리",
    position: "중급 · 8호봉",
    status: "재직",
  },
  {
    no: "EMP-21455",
    name: "배준혁",
    initial: "배",
    tone: "orange",
    rank: "주임",
    position: "초급 · 4호봉",
    status: "재직",
  },
];

export default function OrganizationPage() {
  const [selectedDept, setSelectedDept] = useState("2");
  const [deptKeyword, setDeptKeyword] = useState("");

  const filteredDepts = DEPARTMENTS.filter((d) => d.name.includes(deptKeyword));

  return (
    <main className={styles.main}>
          {/* 페이지 헤더 */}
          <div className={styles.pageHeader}>
            <div>
              <h1>조직관리</h1>
              <p>병원의 조직 구조와 부서별 정보를 조회하고 관리합니다.</p>
            </div>
            <div className={styles.pageActions}>
              <button type="button" className={styles.outlineBtn}>
                조직도 인쇄
              </button>
              <button type="button" className={styles.primaryBtn}>
                + 부서 등록
              </button>
            </div>
          </div>

          {/* 요약 카드 */}
          <div className={styles.summaryRow}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIconBlue}>🏢</div>
              <div>
                <label>전체 부서 수</label>
                <p>
                  18<span>개</span>
                </p>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIconGreen}>👥</div>
              <div>
                <label>전체 소속 인원</label>
                <p>
                  2,184<span>명</span>
                </p>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIconOrange}>🏛</div>
              <div>
                <label>상위 부문 수</label>
                <p>
                  3<span>개</span>
                </p>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIconPurple}>⚠</div>
              <div>
                <label>미배정 조직 번호</label>
                <p>
                  3<span>건</span>
                </p>
              </div>
            </div>
          </div>

          {/* 전체 조직도 */}
          <section className={styles.orgChartSection}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>전체 조직도</h2>
                <p>병원의 조직 계층 구조, 18개 부서로 구성되어 있습니다.</p>
              </div>
              <div className={styles.legend}>
                <span>
                  <i className={styles.dotBlue} /> 경영진
                </span>
                <span>
                  <i className={styles.dotGreen} /> 부문
                </span>
                <span>
                  <i className={styles.dotGray} /> 부서
                </span>
              </div>
            </div>

            <div className={styles.orgChart}>
              {/* 최상위 */}
              <div className={styles.orgRoot}>
                <div className={styles.orgNodeRoot}>
                  병원<span>전체 2,184명</span>
                </div>
              </div>

              {/* 1depth 연결선 */}
              <div className={styles.orgConnector} />

              {/* 부문 3개 */}
              <div className={styles.orgLevel}>
                <div className={styles.orgNodeDept}>
                  진료부문<span>142명</span>
                </div>
                <div className={styles.orgNodeDept}>
                  간호부문<span>64명</span>
                </div>
                <div className={styles.orgNodeDept}>
                  행정지원부문<span>42명</span>
                </div>
              </div>

              {/* 2depth 부서들 */}
              <div className={styles.orgSubLevel}>
                <div className={styles.orgSubGroup}>
                  <div className={styles.orgNode}>
                    영상의학과<span>42명</span>
                  </div>
                  <div className={styles.orgNode}>
                    진단검사의학과<span>28명</span>
                  </div>
                  <div className={styles.orgNode}>
                    응급의학과<span>20명</span>
                  </div>
                  <div className={styles.orgNode}>
                    약제부<span>18명</span>
                  </div>
                </div>
                <div className={styles.orgSubGroup}>
                  <div className={styles.orgNode}>
                    간호부<span>89명</span>
                  </div>
                  <div className={styles.orgNode}>
                    감염관리실<span>8명</span>
                  </div>
                </div>
                <div className={styles.orgSubGroup}>
                  <div className={styles.orgNode}>
                    원무과<span>24명</span>
                  </div>
                  <div className={styles.orgNode}>
                    인사총무팀<span>12명</span>
                  </div>
                  <div className={styles.orgNode}>
                    시설관리팀<span>9명</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 하단: 부서 목록 + 상세 */}
          <div className={styles.bottomLayout}>
            {/* 부서 목록 */}
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
                    className={`${styles.deptItem} ${
                      selectedDept === dept.id ? styles.deptItemActive : ""
                    } ${dept.parent ? styles.deptParent : ""}`}
                    onClick={() => setSelectedDept(dept.id)}
                  >
                    <span className={styles.deptName}>{dept.name}</span>
                    <span className={styles.deptCount}>{dept.count}명</span>
                  </button>
                ))}
              </div>
            </section>

            {/* 부서 상세 */}
            <section className={styles.deptDetailBox}>
              <div className={styles.deptDetailHeader}>
                <div className={styles.deptDetailTitle}>
                  <span className={styles.deptIcon}>🏥</span>
                  <div>
                    <h3>영상의학과</h3>
                    <p>DEPT-1002 · 진료부문 소속</p>
                  </div>
                </div>
                <button type="button" className={styles.outlineBtn}>
                  정보 수정
                </button>
              </div>

              <div className={styles.deptInfoGrid}>
                <div>
                  <label>상위 부서</label>
                  <p>진료부문</p>
                </div>
                <div>
                  <label>부서장</label>
                  <p>박서준 부장</p>
                </div>
                <div>
                  <label>소속 인원</label>
                  <p>42명</p>
                </div>
                <div>
                  <label>설립일</label>
                  <p>2008.04.01</p>
                </div>
                <div>
                  <label>위치</label>
                  <p>본관 3층</p>
                </div>
                <div>
                  <label>내선 번호</label>
                  <p>02-1234-3300</p>
                </div>
              </div>

              <div className={styles.deptDesc}>
                <label>부서 설명</label>
                <p>
                  X-ray, CT, MRI 등 영상 진단 및 판독 업무를 담당하며,
                  응급의학과·진료부문 산하 검사 협진을 지원합니다.
                </p>
              </div>

              <div className={styles.deptChild}>
                <label>하위 조직 (2)</label>
                <div className={styles.childTags}>
                  <span>영상 간호</span>
                  <span>방사선안전관리팀</span>
                </div>
              </div>

              {/* 소속 직원 */}
              <div className={styles.memberSection}>
                <div className={styles.memberHeader}>
                  <h4>소속 직원</h4>
                  <button type="button" className={styles.linkBtn}>
                    직원 관리에서 전체 보기 →
                  </button>
                </div>

                <table className={styles.memberTable}>
                  <thead>
                    <tr>
                      <th>사번</th>
                      <th>이름</th>
                      <th>직급</th>
                      <th>직책 · 호봉</th>
                      <th>재직상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MEMBERS.map((m) => (
                      <tr key={m.no}>
                        <td>{m.no}</td>
                        <td>
                          <div className={styles.memberName}>
                            <span
                              className={`${styles.memberAvatar} ${styles[m.tone]}`}
                            >
                              {m.initial}
                            </span>
                            {m.name}
                          </div>
                        </td>
                        <td>{m.rank}</td>
                        <td>{m.position}</td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${
                              m.status === "부서장"
                                ? styles.statusLeader
                                : styles.active
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
  );
}
