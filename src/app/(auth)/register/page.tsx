import type { Metadata } from "next";

import { RegisterForm } from "@/components/features/auth/register-form";

export const metadata: Metadata = {
  title: "Đăng ký",
  description: "Tạo tài khoản TaskFlow miễn phí.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
