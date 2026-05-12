import {
  ArrowRight,
  Calendar,
  Github,
  KanbanSquare,
  Keyboard,
  ListChecks,
  Moon,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* ─────────────────────────────── Top bar */}
      <header className="border-border/60 supports-[backdrop-filter]:bg-background/70 sticky top-0 z-30 border-b backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm">
                Đăng nhập
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="gap-1.5">
                Bắt đầu <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────── Hero */}
      <section className="relative overflow-hidden">
        {/* Subtle radial gradient backdrop */}
        <div
          aria-hidden
          className="from-brand/10 pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] via-transparent to-transparent"
        />
        <div className="mx-auto w-full max-w-6xl px-4 pt-16 pb-12 sm:px-6 sm:pt-24 sm:pb-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="bg-brand/10 text-brand ring-brand/20 mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1">
              <Sparkles className="size-3.5" />
              <span>Portfolio demo · Frontend Intern / Fresher</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-6xl">
              Where productivity meets{" "}
              <span className="from-brand to-brand/60 bg-gradient-to-br bg-clip-text text-transparent">
                simplicity
              </span>
            </h1>
            <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-pretty sm:text-lg">
              TaskFlow là smart task manager hiện đại — Kanban kéo thả, List view có filter mạnh,
              Calendar theo deadline, và command palette ⌘K như Linear.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="w-full gap-1.5 sm:w-auto">
                  Tạo tài khoản miễn phí <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Dùng demo (không cần đăng ký)
                </Button>
              </Link>
            </div>
            <p className="text-muted-foreground/80 mt-4 text-xs">
              Demo account: <code className="font-mono">demo@taskflow.app</code> /{" "}
              <code className="font-mono">demo1234</code>
            </p>
          </div>

          {/* ─────────────────────────────── Mock app preview */}
          <div className="relative mx-auto mt-16 max-w-5xl">
            <div className="from-brand/30 to-brand/10 absolute -inset-x-4 -inset-y-2 -z-10 rounded-3xl bg-gradient-to-br blur-2xl" />
            <div className="bg-card ring-border/60 overflow-hidden rounded-xl shadow-2xl ring-1">
              <div className="border-border/60 bg-muted/40 flex items-center gap-1.5 border-b px-4 py-2">
                <span className="size-3 rounded-full bg-rose-400/80" />
                <span className="size-3 rounded-full bg-amber-400/80" />
                <span className="size-3 rounded-full bg-emerald-400/80" />
                <div className="bg-background/60 text-muted-foreground mx-auto rounded-md px-3 py-0.5 font-mono text-xs">
                  taskflow.app
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 p-6 sm:gap-4 sm:p-8">
                <PreviewColumn title="Todo" count={3} hue="bg-zinc-400" />
                <PreviewColumn title="In Progress" count={2} hue="bg-info" />
                <PreviewColumn title="Done" count={4} hue="bg-success" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────── Features */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Mọi thứ bạn cần để hoàn thành công việc
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl">
            Phát triển bằng Next.js 16, React 19, Tailwind v4 và shadcn/ui — chuẩn industry 2026.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Feature
            icon={KanbanSquare}
            title="Kanban Board"
            desc="Kéo thả tasks giữa các columns với @dnd-kit. Smooth, accessible, mobile-friendly."
          />
          <Feature
            icon={ListChecks}
            title="List View"
            desc="Sort theo priority, due date, title. Filter đa chiều — lưu state vào URL."
          />
          <Feature
            icon={Calendar}
            title="Calendar View"
            desc="Nhìn deadline theo tuần / tháng. Click vào ngày để tạo task mới ngay tại đó."
          />
          <Feature
            icon={Search}
            title="Search & Command Palette"
            desc="⌘K mở command palette như Linear. Search global theo title, tag, description."
          />
          <Feature
            icon={Keyboard}
            title="Keyboard Shortcuts"
            desc="⌘N tạo task, ⌘/ xem shortcuts, Esc đóng modal. Power-user workflow đầy đủ."
          />
          <Feature
            icon={Moon}
            title="Dark mode"
            desc="Theme tokens OKLCH, theo system preference mặc định. Không có flash khi load."
          />
        </div>
      </section>

      {/* ─────────────────────────────── Footer */}
      <footer className="border-border/60 mt-auto border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm sm:flex-row sm:px-6">
          <Logo iconOnly className="opacity-80" />
          <p className="text-muted-foreground text-center">
            Built with Next.js 16 + Tailwind v4 + shadcn/ui · Portfolio © {new Date().getFullYear()}
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
            aria-label="GitHub repository"
          >
            <Github className="size-4" /> Source
          </a>
        </div>
      </footer>
    </div>
  );
}

/* ─────────────────────────────── Sub-components */

function Feature({
  icon: Icon,
  title,
  desc,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-card border-border/60 group rounded-xl border p-6 transition-all hover:shadow-md">
      <div className="bg-brand/10 text-brand inline-flex size-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function PreviewColumn({ title, count, hue }: { title: string; count: number; hue: string }) {
  return (
    <div className="bg-muted/50 rounded-lg p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`size-2 rounded-full ${hue}`} />
          <span className="text-xs font-medium">{title}</span>
        </div>
        <span className="text-muted-foreground text-xs">{count}</span>
      </div>
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="bg-background border-border/60 rounded-md border px-3 py-2 shadow-xs"
          >
            <div className="bg-muted-foreground/30 h-2 w-3/4 rounded" />
            <div className="bg-muted-foreground/20 mt-2 h-1.5 w-1/2 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
