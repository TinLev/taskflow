import type { Metadata } from "next";

import { LoginForm } from "@/components/features/auth/login-form";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập vào TaskFlow để quản lý công việc của bạn.",
};

export default function LoginPage() {
  return <LoginForm />;
}
