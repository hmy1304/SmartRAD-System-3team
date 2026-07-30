const fs = require('fs');

let lp = fs.readFileSync('src/component/dashboard/LeavePage/LeavePage.tsx', 'utf8');

// 1. Add useRouter import
lp = lp.replace(
  'import { useMemo, useState, useEffect, useRef, useCallback } from "react";',
  'import { useMemo, useState, useEffect, useRef, useCallback } from "react";\nimport { useRouter } from "next/navigation";'
);

// 2. Add router instance
lp = lp.replace(
  'export default function LeavePage() {',
  'export default function LeavePage() {\n  const router = useRouter();'
);

// 3. Update the button onClick
lp = lp.replace(
  /onClick=\{\(\) => \{\s*setSelectedEmp\(currentViewer\);\s*setIsModalOpen\(true\);\s*\}\}/g,
  'onClick={() => { router.push("/dashboard/drafts"); }}'
);

// 4. Remove Modal state
lp = lp.replace(
  /\/\/ 모달 제어 및 입력 폼 상태[\s\S]*?\/\/ 첨부파일 바로보기 모달 상태/,
  '// 첨부파일 바로보기 모달 상태'
);

// 5. Remove handleModalSubmit
lp = lp.replace(
  /const handleModalSubmit = async \(\) => \{[\s\S]*?catch \(err\) \{[\s\S]*?\}[\s\S]*?\};/,
  ''
);

// 6. Remove the modal JSX block entirely
// We can find the start of the modal and truncate it since it's at the end of the file
const parts = lp.split('{/* 휴가 등록 모달 오버레이 */}');
if (parts.length > 1) {
  lp = parts[0] + '    </main>\n  );\n}\n';
}

fs.writeFileSync('src/component/dashboard/LeavePage/LeavePage.tsx', lp, 'utf8');
console.log('LeavePage.tsx successfully fixed!');
