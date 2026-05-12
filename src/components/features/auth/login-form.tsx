"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, LogIn, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";
import { DEMO_CREDENTIALS } from "@/lib/constants";
import { LoginSchema, type LoginInput } from "@/lib/validations";

export function LoginForm() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Already signed in? Bounce to dashboard.
  useEffect(() => {
    if (!authLoading && isAuthenticated) router.replace("/dashboard");
  }, [authLoading, isAuthenticated, router]);

  async function onSubmit(values: LoginInput) {
    const result = await login(values);
    if (!result.ok) {
      toast.error(result.error);
      // Set a field-level error too so the form highlights the inputs.
      form.setError("password", { message: result.error });
      return;
    }
    toast.success("Đăng nhập thành công 👋");
    router.replace("/dashboard");
  }

  function fillDemoAndSubmit() {
    form.setValue("email", DEMO_CREDENTIALS.email);
    form.setValue("password", DEMO_CREDENTIALS.password);
    void form.handleSubmit(onSubmit)();
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Đăng nhập</CardTitle>
        <CardDescription>Tiếp tục công việc đang dở của bạn.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        disabled={isSubmitting}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-3"
                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Đang đăng nhập...
                </>
              ) : (
                <>
                  <LogIn className="size-4" /> Đăng nhập
                </>
              )}
            </Button>
          </form>
        </Form>

        <div className="relative my-5">
          <Separator />
          <span className="bg-card text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-xs">
            hoặc
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          onClick={fillDemoAndSubmit}
          disabled={isSubmitting}
        >
          <Sparkles className="size-4" /> Dùng tài khoản demo
        </Button>
      </CardContent>
      <CardFooter className="justify-center text-sm">
        <span className="text-muted-foreground">Chưa có tài khoản?&nbsp;</span>
        <Link href="/register" className="text-brand font-medium hover:underline">
          Đăng ký miễn phí
        </Link>
      </CardFooter>
    </Card>
  );
}
