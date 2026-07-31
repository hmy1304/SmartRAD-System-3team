# SmartRAD HR — QA 보수 작업 내역 리포트 (2026-07-31)

본 리포트는 '부서코드 무결성 수정(Phase 4)'을 진행하기 이전, 시스템 전반에 걸쳐 수행된 주요 보안 및 비즈니스 로직, 프론트엔드 최적화 보수 내역을 정리한 문서입니다.

---

## 1. Phase 1: 보안 및 인가(Authorization) 모델 완벽 전환

기존 방식에서는 API 호출 시 `employeeId`나 `requesterId` 같은 식별자를 쿼리 파라미터나 바디로 직접 전달하여 데이터 위변조 및 권한 탈취에 취약했습니다. 이를 해결하기 위해 JWT 토큰 기반의 인가 시스템으로 전면 개편했습니다.

*   **인증 주체 식별자 제거 및 보안 강화**:
    *   `LeaveController`, `AttendanceController`, `DutyScheduleController`, `ApprovalController` 등 주요 컨트롤러에서 파라미터로 넘어오던 식별자를 모두 제거했습니다.
    *   `JwtTokenProvider` 및 `CustomUserDetails`를 연동하여 추출되는 `@AuthenticationPrincipal`을 통해 서버 단에서 안전하게 사용자 정보를 식별하도록 변경했습니다.
*   **권한(Role) 기반 엔드포인트 제어**:
    *   `SecurityConfig` 및 `RoleMapper`를 업데이트하여 `/payroll-settings/**` 등 민감한 관리자 기능에 대해 HR 및 ADMIN 권한을 가진 유저만 접근할 수 있도록 보안을 강화했습니다.
*   **글로벌 예외 처리 중앙화**:
    *   `GlobalExceptionHandler`를 신규 생성하여, 권한 없음이나 유효성 검증 실패 시 불필요한 서버 내부 정보가 노출되지 않고 일관된 에러 응답 객체 형태가 프론트엔드로 전달되도록 조치했습니다.

## 2. Phase 2: 핵심 비즈니스 로직 및 결함 수정

QA 과정에서 발견된 주요 비즈니스 결함과 상태 값 불일치 문제를 해결했습니다.

*   **휴가 결재 연동 및 상태값 매핑 수정**:
    *   `ApprovalService` 내에서 휴가 신청 결재 상태값이 정상적으로 반영되지 않던 문제를 수정했습니다. (기존 `"확인중"`으로 매핑되던 로직을 `"승인대기"`로 정상화)
    *   휴가가 최종 승인되거나 반려될 때 `LeaveService.updateStatus` 메서드를 호출하도록 연동하여, 실제 직원의 연차(Leave Quota)가 올바르게 차감되거나 복구되도록 구현했습니다.
*   **인사 발령 기안함 IDOR(Insecure Direct Object Reference) 취약점 조치**:
    *   `AppointmentRepository`에 기안자 본인의 문서만 필터링하여 조회하는 `findByEmployeeIdOrderByApplyDateDesc` 쿼리 메서드를 추가했습니다.
    *   이를 통해 타 직원의 인사 발령 내역이 불필요하게 노출되던 권한 탈취 오류를 완전히 해결했습니다.

## 3. Phase 3: 프론트엔드 최적화 및 안정화

프론트엔드 통신 상태를 최적화하고 백엔드 API와의 연동 시 발생하는 환경 변수 및 의존성 문제를 해결했습니다.

*   **인증 헤더 유틸리티 및 쿠키 의존성 제거**:
    *   기존 `cookies-next` 의존성 문제로 인해 빌드가 실패하는 오류를 해결하기 위해 `currentUser.ts`, `authHeaders.ts`를 순수 자바스크립트(Native JS) 기반의 쿠키 파싱으로 재작성했습니다.
    *   `customFetch.ts`를 신설하여 모든 백엔드 API 호출 시 `Authorization: Bearer <token>` 헤더가 자동으로 주입되게 구성했습니다.
    *   401 (Unauthorized) 오류 발생 시 안전하게 로그인 화면으로 리디렉션 처리되도록 글로벌 페치 래퍼(Fetch Wrapper)를 최적화했습니다.
*   **하드코딩 및 경로 오류 완전 제거**:
    *   `DutyPage` 컴포넌트 스케줄러에서 테스트용으로 하드코딩되었던 `requesterId: 1` 값을 삭제하고 토큰 기반 통신으로 전환했습니다.
    *   `PayrollModals` 등 다수의 페이지에 남아있던 로컬 절대 경로(`http://localhost:8080`)를 삭제했습니다. 대신 `next.config.ts`의 `rewrites` 프록시 라우팅 규칙을 활용해 상대 경로(`/payroll-settings/...`)로 유연하게 통신할 수 있도록 설정했습니다.

## 4. Phase 4: 기타 파일 정리 (Cleanup)

보수 작업 중 남겨진 불필요한 레거시 파일과 임시 테스트용 스크립트들을 모두 제거하여 프로젝트의 무결성을 확보했습니다.

*   **삭제된 파일 목록**:
    *   `backend_logs.txt`, `fixer.js`, `fix_leavepage.py`, `patch_service.py` (루트 디렉토리 및 프론트엔드 내부)
    *   `backend/Test.java`, `backend/BcryptTest.java` 등 임시로 작성된 자바 클래스 파일

---
이상의 작업들은 `hmy-work2` 브랜치에 안전하게 병합 및 컴파일되었으며, 배포 환경에서 정상 작동함이 검증되었습니다.
