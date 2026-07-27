# [개발자 가이드] 세분화된 메뉴 권한(RBAC) 적용 및 연동 안내

이 가이드는 각 프론트엔드 페이지 및 모듈 개발 시, 15개 하위 네비게이션 화면 단위로 개편된 권한 체계(RBAC)를 코드에 쉽고 정확하게 반영할 수 있도록 작성된 공식 안내서입니다.

---

## 1. 권한 체계 핵심 구조
1. **대상 및 단위:** 카테고리(대분류)가 아닌 **실제 방문하는 개별 페이지(하위 네비게이션) 단위**로 1:1 매핑됩니다.
2. **4대 권한 스위치 (Actions):**
   - `canRead` (조회/입장)
   - `canWrite` (등록/수정/생성)
   - `canDelete` (삭제)
   - `canApprove` (결재 승인/반려/확정)

---

## 2. 프론트엔드 페이지 및 컴포넌트에 권한 적용하기
모든 권한 검사 기능은 `@/utils/permission` 모듈에서 제공됩니다.

### ① 페이지 전체 접근 통제 (`usePageGuard` 훅)
페이지 최상단 컴포넌트(예: `EmployeeListPage.tsx`) 내에서 `usePageGuard("메뉴코드", "canRead")`를 한 줄 호출합니다.
- 조회 권한(`canRead: false`)이 없는 사용자가 URL 직접 입력 등으로 접근할 경우 즉시 경고창을 띄우고 대시보드 메인으로 자동 축출합니다.

```tsx
"use client";
import { usePageGuard } from "@/utils/permission";

export default function EmployeeListPage() {
  // 컴포넌트 렌더링 시작 시 EMP_LIST 메뉴의 canRead 권한 검사
  usePageGuard("EMP_LIST", "canRead");

  return <div>{/* 화면 내용 */}</div>;
}
```

### ② 생성/수정/삭제/결재 버튼 및 UI 요소 숨김/비활성화 (`hasPermission` 유틸)
페이지 조회 권한이 있더라도, 특정 실무 기능(신규 등록, 삭제, 승인 등)은 개별 권한이 없으면 UI 및 이벤트 로직에서 통제해야 합니다.
`hasPermission(메뉴코드, 액션)`을 사용합니다.

```tsx
import { hasPermission } from "@/utils/permission";

export default function ApprovalInboxPage() {
  const canApprove = hasPermission("APPROVAL_INBOX", "canApprove");
  const canDelete = hasPermission("EMP_LIST", "canDelete");

  const handleApprove = () => {
    if (!hasPermission("APPROVAL_INBOX", "canApprove")) {
      alert("결재 승인 권한이 없습니다.");
      return;
    }
    // 승인 처리 API 호출
  };

  return (
    <div>
      <button onClick={handleApprove} disabled={!canApprove}>✓ 승인</button>
      {canDelete && <button onClick={() => deleteItem(123)}>삭제</button>}
    </div>
  );
}
```

---

## 3. 유효한 메뉴 코드 (MenuCode) 매핑 표

| 카테고리 | 메뉴 코드 (`menu_code`) | 설명 (화면명) | 기본 대상 직군 |
| :--- | :--- | :--- | :--- |
| **전자결재** | `APPROVAL_INBOX` | 결재 수신함 (대기/승인) | 관리자, 결재권자 (수간호사 이상) |
| | `APPROVAL_DRAFT` | 기안 문서 작성 (휴가/업무) | **전 사원 개방 (ESS)** |
| **인사관리** | `EMP_LIST` | 직원 등록 및 조회 | 인사담당자, 최고관리자 |
| | `EMP_ORG` | 조직도 조회 | **전 사원 개방 (ESS)** |
| | `APPOINTMENT` | 인사 발령 관리 | 인사담당자, 최고관리자 |
| | `DUTY_SCHEDULE` | 듀티표 편성 및 확정 | 수간호사, 관리자 |
| | `ATTEND_ADMIN` | 근태 이상자 관리/정정 | 인사담당자, 최고관리자 |
| | `ATTEND_CHECK` | 출퇴근 타임스탬프 기록 | **전 사원 개방 (ESS)** |
| | `LEAVE_STATUS` | 연차/휴가 현황 관리 | **전 사원 개방 (ESS)** |
| **급여관리** | `PAYROLL_INFO` | 급여 명세서 조회 | **전 사원 개방 (ESS)** |
| | `PAYROLL_PROC` | 급여 대장 계산 및 마감 | 인사/재무 관리자 전용 |
| | `STATUTORY_REPORT` | 법정 필수 신고 관리 | 인사/재무 관리자 전용 |
| **시스템 관리**| `SYSTEM_ROLES` | 사용자 권한 관리 | 최고관리자 전용 |
| | `SYSTEM_CODE` | 공통 코드 관리 | 최고관리자 전용 |
| **기타** | `NOTICE` | 공지사항 열람 및 등록 | **전 사원 개방** |

---

## 4. 향후 신규 페이지 추가 시 작업 절차
1. **DB 메뉴 등록:** `menu` 테이블에 코드와 한글 명칭을 1줄 INSERT 합니다.
2. **타입 보급:** `frontend/src/utils/permission.ts`의 `MenuCode` 타입에 새 코드를 명시합니다.
3. **자동화된 매핑 (Self-Healing):** 기존 권한 그룹 매핑을 위한 별도 DB 작업은 필요하지 않습니다. 어드민 페이지 접속 시 서버가 자동으로 감지하고 기본 OFF 상태의 체크박스를 전체 권한 그룹에 생성합니다.
