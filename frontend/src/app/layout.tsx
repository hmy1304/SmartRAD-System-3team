import type { Metadata } from "next";
import "@/styles/globals.scss";

export const metadata: Metadata = {
  title: "SmartRAD HR | 병원 인사관리 ERP",
  description:
    "병원 조직, 인사, 근태, 급여, 증명서 업무를 한 화면에서 관리하는 SmartRAD HR 소개 페이지입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
