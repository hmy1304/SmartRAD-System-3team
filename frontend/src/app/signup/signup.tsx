import type { Metadata } from "next";

import AuthShell from "@/component/auth/AuthShell/AuthShell";
import SignupForm from "@/component/auth/SignupForm/SignupForm";

export const metadata: Metadata = {
  title: "회원가입 | SmartRAD HR",
  description: "SmartRAD HR 병원 인사관리 시스템 회원가입",
};

export default function SignupPage() {
  return (
    <AuthShell mode="signup">
      <SignupForm />
    </AuthShell>
  );
}
