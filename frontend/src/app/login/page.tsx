import { Metadata } from 'next';
import LoginPage from '@/component/auth/LoginPage/LoginPage';

export const metadata: Metadata = {
  title: '로그인 | SmartRAD HR',
  description: 'SmartRAD HR 병원 인사관리 ERP 로그인 페이지',
};

export default function Login() {
  return <LoginPage />;
}
