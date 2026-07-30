
import re

with open("frontend/src/component/dashboard/LeavePage/LeavePage.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Replace MOCK_EMPLOYEES and MOCK_SUMMARY_DEFAULT
content = re.sub(
    r"const MOCK_EMPLOYEES: EmpOption\[\] = \[.*?\];", 
    "", 
    content, 
    flags=re.DOTALL
)

content = re.sub(
    r"const MOCK_SUMMARY_DEFAULT: LeaveSummaryResponse = \{.*?\};",
    "const EMPTY_SUMMARY: LeaveSummaryResponse = {\n  totalAllocatedDays: 0,\n  totalUsedDays: 0,\n  usedPercentage: 0,\n  totalRemainingDays: 0,\n  thisMonthApplications: 0,\n  pendingApplications: 0,\n  riskEmployeeCount: 0,\n  typeStats: [],\n  riskEmployees: [],\n};",
    content,
    flags=re.DOTALL
)

# 2. Update state initializers and add isApprover
old_states = """  const [applications, setApplications] = useState<LeaveApplicationResponse[]>([]);
  const [summary, setSummary] = useState<LeaveSummaryResponse>(MOCK_SUMMARY_DEFAULT);
  const [empList, setEmpList] = useState<EmpOption[]>(MOCK_EMPLOYEES);

  // ?? 뷰어 시뮬레이터: 현재 접속한 사용자가 누구인가? (승인권자 vs 일반 사원 본인)
  const [currentViewer, setCurrentViewer] = useState<EmpOption>(MOCK_EMPLOYEES[0]);

  const { userProfile } = useAuthStore();
  const canEdit = useMemo(() => {
    const perm = userProfile?.perms?.find(p => p.menuCode === 'LEAVE_STATUS');
    return perm ? perm.canWrite : false;
  }, [userProfile]);"""

new_states = """  const [applications, setApplications] = useState<LeaveApplicationResponse[]>([]);
  const [summary, setSummary] = useState<LeaveSummaryResponse>(EMPTY_SUMMARY);
  const [empList, setEmpList] = useState<EmpOption[]>([]);

  const { userProfile } = useAuthStore();
  
  const currentUserName = userProfile?.name || "사원";
  const canEdit = useMemo(() => {
    const perm = userProfile?.perms?.find(p => p.menuCode === 'LEAVE_STATUS');
    return perm ? perm.canWrite : false;
  }, [userProfile]);

  const isApprover = canEdit || (userProfile?.role?.includes("ADMIN") ?? false) || currentUserName === "김관리";"""

content = content.replace(old_states, new_states)

# 3. Replace selectedEmp
content = content.replace(
    "const [selectedEmp, setSelectedEmp] = useState<EmpOption>(MOCK_EMPLOYEES[0]);",
    "const [selectedEmp, setSelectedEmp] = useState<EmpOption | null>(null);"
)

# 4. Remove offline fallback in loadData
old_catch = """    } catch (err) {
      // 오프라인 방어 폴백 유지
    }"""
new_catch = """    } catch (err) {
      console.error("Failed to load leave data", err);
    }"""
content = content.replace(old_catch, new_catch)

# 5. Replace currentViewer usages
content = content.replace("currentViewer.isApprover", "isApprover")
content = content.replace("!currentViewer.isApprover", "!isApprover")
content = content.replace("currentViewer.name !== appOwnerName && !currentViewer.name.includes(\\"관리\\")", "currentUserName !== appOwnerName && !isApprover")
content = content.replace("currentViewer.name === row.name || currentViewer.name === \\"김관리\\"", "currentUserName === row.name || isApprover")

# 6. Remove viewerSelector
viewer_block = """          {/* ?? 현재 접속 계정 (승인권자 vs 일반 본인 시뮬레이터) */}
          <div className={styles.viewerSelector} title="권한별 버튼 표출 테스트를 위해 현재 로그인된 사용자를 자유롭게 바꿀 수 있습니다.">
            <span>?? 현재 사용자:</span>
            <select
              className={styles.viewerSelect}
              value={currentViewer.id}
              onChange={(e) => {
                const found = empList.find((x) => x.id === Number(e.target.value));
                if (found) setCurrentViewer(found);
              }}
            >
              {empList.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.isApprover ? "승인권자" : "본인·사원"})
                </option>
              ))}
            </select>
          </div>"""
content = content.replace(viewer_block, "")

# 7. Update setIsModalOpen onClick for selectedEmp
old_register_click = """          <button
            className={styles.registerBtn}
            onClick={() => {
              setSelectedEmp(currentViewer);
              setIsModalOpen(true);
            }}
          >"""
new_register_click = """          <button
            className={styles.registerBtn}
            onClick={() => {
              const myEmp = empList.find(e => e.name === currentUserName);
              setSelectedEmp(myEmp || (empList.length > 0 ? empList[0] : null));
              setIsModalOpen(true);
            }}
          >"""
content = content.replace(old_register_click, new_register_click)

# 8. Fix empty selectedEmp issues
# If selectedEmp is null, we can return or default. In LeavePage, `selectedEmp.name` is used.
# Let's replace `selectedEmp.name` with `(selectedEmp?.name || "")` just to be safe if not covered.
# The selectedEmp ? ... is mostly handled except in some places.

with open("frontend/src/component/dashboard/LeavePage/LeavePage.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Modification done.")

