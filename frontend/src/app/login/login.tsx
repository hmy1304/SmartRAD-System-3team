import type { Metadata } from "next";

import AuthShell from "@/component/auth/AuthShell/AuthShell";
import LoginForm from "@/component/auth/LoginForm/LoginForm";

export const metadata: Metadata = {
  title: "로그인 | SmartRAD HR",
  description: "SmartRAD HR 병원 인사관리 시스템 로그인",
};

export default function LoginPage() {
  return (
    <AuthShell mode="login">
      <LoginForm />
    </AuthShell>
  );
}
