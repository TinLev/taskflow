<div align="center">

# 🚀 TaskFlow

**Where productivity meets simplicity.**

Smart task management web app — Kanban, List, Calendar, drag-and-drop, command palette, dark mode.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js) ![React](https://img.shields.io/badge/React-19-149eca?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss) ![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Radix-000) ![pnpm](https://img.shields.io/badge/pnpm-11-f69220?logo=pnpm)

[Live demo](https://taskflow-omega-rosy.vercel.app) · [Source](https://github.com/TinLev/taskflow) · [Báo cáo bug](https://github.com/TinLev/taskflow/issues)

</div>

---

## 📖 Mục lục · Table of contents

- [🇻🇳 Tiếng Việt](#-tiếng-việt)
- [🇬🇧 English](#-english)
- [⚙️ Quick start](#️-quick-start)
- [🔑 Demo credentials](#-demo-credentials)
- [🏗 Kiến trúc · Architecture](#-kiến-trúc--architecture)
- [🧱 Cấu trúc thư mục · Project structure](#-cấu-trúc-thư-mục--project-structure)
- [🛠 Scripts](#-scripts)
- [💡 Lessons learned](#-lessons-learned)

---

## 🇻🇳 Tiếng Việt

TaskFlow là **smart task manager** mô phỏng UX của Linear / Notion / Height, được xây làm sản phẩm portfolio cho vị trí Frontend Intern / Fresher. Toàn bộ data lưu trong `localStorage` — không cần backend, deploy được trên Vercel ngay.

### ✨ Tính năng

- 🔐 **Authentication mô phỏng** — login/register validation đầy đủ (zod), demo account seed sẵn
- 🏢 **Workspaces & Projects** — tổ chức theo cấp nhiều workspace → nhiều project
- ✅ **Task management** — 5 status, 4 priority, due date, tags, subtasks, assignee
- 🎯 **3 views**: **Kanban** (drag & drop @dnd-kit), **List** (sort/filter), **Calendar** (month grid)
- 🔍 **Filter & Sort** — URL query params (refresh giữ filter, share link OK)
- ⌨️ **Command Palette** (⌘K) — navigate, tạo task, đổi theme... như Linear
- ⚡ **Keyboard shortcuts** — ⌘K, ⌘N (new task), ⌘/ (help), Esc (close)
- ☑️ **Bulk actions** — chọn nhiều task → đổi status / priority / xóa
- 📥 **Export / Import** — JSON đầy đủ + CSV (tasks only)
- 🌗 **Dark mode** — light / dark / system, OKLCH color tokens
- 📱 **Responsive** — mobile bottom drawer, tablet collapsible sidebar, desktop full
- 🌐 **Tiếng Việt** — toàn bộ UI tiếng Việt, font Geist với subset `latin-ext`

### 🛠 Tech stack

| Layer | Tech |
|-------|------|
| Framework | **Next.js 16** (App Router, Turbopack) |
| UI | **React 19** + **TypeScript 5** (strict + `noUncheckedIndexedAccess`) |
| Styling | **Tailwind CSS v4** (CSS-based `@theme`) + **shadcn/ui** (Radix) |
| State | React Context API + `useReducer` |
| Forms | `react-hook-form` + `zod` (zod 4 với `z.input` types) |
| Drag & drop | `@dnd-kit/core` + `@dnd-kit/sortable` |
| Animations | `framer-motion` + `tw-animate-css` |
| Date | `date-fns` + locale `vi` |
| Theme | `next-themes` (attribute class) |
| Toasts | `sonner` |
| Icons | `lucide-react` |
| Storage | `localStorage` với zod-validated wrapper |
| Lint / Format | ESLint 9 (flat config) + Prettier + Tailwind class sort |
| Package manager | **pnpm** (qua Corepack) |

---

## 🇬🇧 English

TaskFlow is a **smart task manager** inspired by Linear / Notion / Height, built as a portfolio piece for Frontend Intern/Fresher roles. Everything is client-side (`localStorage`) — no backend required, deploys instantly to Vercel.

### ✨ Features

- 🔐 **Mock authentication** — full form validation (zod), pre-seeded demo account
- 🏢 **Workspaces & Projects** — two-level hierarchy
- ✅ **Task CRUD** — 5 statuses, 4 priorities, due date, tags, subtasks, assignee
- 🎯 **3 views**: **Kanban** (drag & drop via `@dnd-kit`), **List** (sort/filter), **Calendar** (month grid)
- 🔍 **Filter & Sort** — backed by URL query params (refresh preserves, share-link works)
- ⌨️ **Command Palette** (⌘K) — navigation, task creation, theme switch
- ⚡ **Keyboard shortcuts** — ⌘K, ⌘N (new task), ⌘/ (help), Esc (close)
- ☑️ **Bulk actions** — multi-select rows → change status/priority/delete
- 📥 **Export / Import** — full JSON + tasks CSV
- 🌗 **Dark mode** — light / dark / system, OKLCH-based palette
- 📱 **Responsive** — mobile drawer, tablet collapsible sidebar, desktop full layout
- 🌐 **Vietnamese UI** — entire app localized

---

## ⚙️ Quick start

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** (auto-installed via Corepack): `corepack enable pnpm`

### Installation

```bash
# Clone
git clone <repo-url> taskflow
cd taskflow

# Install
pnpm install

# Run dev server (Turbopack)
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

### Build for production

```bash
pnpm build      # build optimized bundle
pnpm start      # serve production build
```

---

## 🔑 Demo credentials

Recruiter / reviewer có thể đăng nhập ngay với tài khoản mẫu — workspaces / projects / 15 tasks được seed tự động:

```
Email:    demo@taskflow.app
Password: demo1234
```

Click nút **"Dùng tài khoản demo"** trên trang `/login` để auto-fill và đăng nhập.

> 💡 Bạn cũng có thể tự đăng ký account mới — sẽ được khởi tạo 1 workspace **"Personal"** trống, dữ liệu hoàn toàn tách biệt với demo account (filter theo `ownerId`).

---

## 🏗 Kiến trúc · Architecture

### Provider chain

```
<ThemeProvider>                  // next-themes
  <AuthProvider>                 // current user + login/register/logout
    <TooltipProvider>            // Radix
      // landing + auth routes
      <DashboardLayout>          // gated by <AuthGuard>
        <WorkspaceProvider>      // useReducer
          <ProjectProvider>      // useReducer
            <TaskProvider>       // useReducer
              ...views...
              <CommandPalette /> // ⌘K launcher (mounted once)
```

### Data model

Tất cả entity được persist trong `localStorage` qua `safeStorage` wrapper với zod validation on read:

```
taskflow:user              → User | null              (current session)
taskflow:users             → StoredUser[]             (all registered users)
taskflow:workspaces        → Workspace[]              (all users)
taskflow:projects          → Project[]                (all users)
taskflow:tasks             → Task[]                   (all users)
taskflow:active_workspace  → string | null            (last selected)
```

**Multi-user isolation**: arrays chứa data của tất cả users (giống một database table). Context selectors filter theo `ownerId` (workspace) hoặc `projectId ∈ my workspaces` (task) — mirror lại pattern row-level security của Postgres.

### Reducer pattern

Mỗi context (Workspace / Project / Task) dùng `useReducer` với pattern thống nhất:

- **State**: `{ items, isLoading, ...secondary }`
- **Actions**: `HYDRATE | CREATE | UPDATE | DELETE | RESET | ...`
- **Selectors** (`useMemo`): filter & sort scope-aware
- **Mutations** (`useCallback`): dispatch actions, ignore unauthorized writes
- **Persistence** (`useEffect`): write to `localStorage` on state change

### Drag-and-drop (Kanban)

- 1 × `DndContext` cho toàn board
- N × `SortableContext` (per column) với `verticalListSortingStrategy`
- Mỗi column cũng là `useDroppable` để cho phép drop vào column trống
- `closestCorners` collision detection + `DragOverlay` để hiển thị card trong khi kéo
- Drop handler: detect column-vs-task target → renumber affected columns qua `BATCH_UPDATE` reducer action (consecutive integer orders, đơn giản hơn fractional ordering)
- Filters auto-disable drag — reordering filtered list sẽ tạo "lost task" bug nếu có ẩn

### URL-backed filters

```ts
// /list?status=todo,in_progress&priority=urgent&tags=feature&sort=due
```

`useTaskFilters` hook đọc/ghi URL search params. Refresh giữ state, share link OK, browser back navigates filter changes — không cần thêm client state. `applyTaskFilters` là pure function, memoize được.

### Validation: zod-first

- Schemas trong `lib/validations.ts` là **single source of truth**
- Types được infer (`z.infer` cho output, `z.input` cho form input — quan trọng cho fields có `.default()`)
- `safeStorage.get(key, schema, fallback)` validate runtime — corrupt data không crash app
- Cùng schemas dùng cho form validation (qua `zodResolver`) + storage round-trip

---

## 🧱 Cấu trúc thư mục · Project structure

```
src/
├── app/                                  Next.js App Router
│   ├── (auth)/                          Centered shell cho login/register
│   ├── dashboard/                       Protected — AuthGuard + providers
│   │   ├── workspace/[id]/              Workspace detail + project grid
│   │   │   └── project/[projectId]/     Layout chung + 3 view routes
│   │   │       ├── page.tsx             → Kanban (default)
│   │   │       ├── list/page.tsx        → List
│   │   │       └── calendar/page.tsx    → Calendar
│   │   ├── settings/page.tsx            Tabs: Account, Workspaces, Data, Danger
│   │   └── page.tsx                     Dashboard home (stats + workspaces)
│   ├── page.tsx                         Landing page
│   ├── layout.tsx                       Root providers
│   └── globals.css                      Tailwind v4 + OKLCH tokens
│
├── components/
│   ├── ui/                              shadcn/ui (Radix-based)
│   ├── layout/                          sidebar, header, mobile-nav, user-menu
│   ├── shared/                          theme-toggle, logo, loading-spinner...
│   └── features/
│       ├── auth/                        login-form, register-form, auth-guard
│       ├── workspace/                   switcher, form-dialog, delete-dialog
│       ├── project/                     list, form-dialog, card
│       ├── task/                        modal, filters, badges, subtask-list, tag-input
│       ├── kanban/                      board, column, card (dnd-kit)
│       ├── list-view/                   task-list-view, bulk-action-bar
│       ├── calendar-view/               month grid
│       └── command-palette/             ⌘K launcher
│
├── contexts/
│   ├── auth-context.tsx                 useState (single user)
│   ├── workspace-context.tsx            useReducer + seeding
│   ├── project-context.tsx              useReducer + cascade helper
│   └── task-context.tsx                 useReducer + bulk + reorder
│
├── hooks/
│   ├── use-local-storage.ts             cross-tab sync via storage event
│   ├── use-debounce.ts
│   ├── use-media-query.ts               useSyncExternalStore-based
│   ├── use-keyboard-shortcut.ts         mod/cmd/ctrl-aware
│   └── use-task-filters.ts              URL query-param state
│
├── lib/
│   ├── utils.ts                         cn() helper
│   ├── constants.ts                     status/priority configs, storage keys
│   ├── validations.ts                   zod schemas (single source of truth)
│   ├── storage.ts                       safeStorage wrapper
│   ├── id.ts                            crypto.randomUUID-based
│   ├── shortcuts.ts                     keyboard shortcut registry
│   └── data-export.ts                   JSON/CSV export + import
│
├── types/                               z.infer-derived domain types
└── data/mock-data.ts                    Demo user seed (2 ws, 4 prj, 15 tasks)
```

---

## 🛠 Scripts

```bash
pnpm dev          # Dev server với Turbopack (HMR)
pnpm build        # Production build (next build)
pnpm start        # Serve production build
pnpm lint         # ESLint check
pnpm lint:fix     # ESLint auto-fix
pnpm format       # Prettier format toàn project
pnpm format:check # Verify format không có drift
pnpm type-check   # tsc --noEmit (no JS output)
```

CI checklist trước khi merge: `pnpm type-check && pnpm lint && pnpm format:check && pnpm build`.

---

## 💡 Lessons learned

> Những điểm thú vị / tricky đã học được khi xây project này — chia sẻ kinh nghiệm phỏng vấn.

### 1. Zod 4 `z.input` vs `z.infer` (= `z.output`)

Schema có `.default(...)` cho **2 type khác nhau:**
- `z.output` (= `z.infer`): post-parse — field required (`tags: string[]`)
- `z.input`: pre-parse — field optional (`tags?: string[] | undefined`)

`react-hook-form` + `zodResolver` cần **input type** vì form chưa qua parse. Dùng nhầm `z.infer` cho `useForm<T>` → TS error khó debug. Bài học: luôn dùng `z.input<>` cho form values, `z.infer<>` cho parsed data.

### 2. React 19 strict lint

Rules mới như `set-state-in-effect` và `refs in render` rất khắt khe. Đa số fix bằng:
- `useSyncExternalStore` cho external subs (media query, theme)
- Cập nhật `ref.current` trong `useEffect`, không phải render body
- `useWatch` thay `form.watch()` (React Compiler không thể memoize function return)

### 3. Multi-user isolation không cần multi-tenancy

`localStorage` shared giữa users → cần filter theo `ownerId` ở Context selector. Mirror pattern row-level security của Postgres. Trade-off: data tất cả users trong cùng 1 array → không cần thay đổi key khi đổi user, nhưng phải filter mọi nơi.

### 4. Drag-and-drop với `@dnd-kit`

- 1 `DndContext`, N `SortableContext` (per column)
- Detect column-vs-task drop target qua `over.data.current.type`
- `BATCH_UPDATE` reducer action → consecutive integer orders → tránh fractional ordering complexity
- Drag tự disable khi filter active — reordering filtered list = lost task bug

### 5. shadcn `FormField` + RHF 7 + zod 4

shadcn-generated `FormField` forward 2 generics `<TFieldValues, TName>` nhưng `Controller` v7 có **3 generics** với `TTransformedValues`. Khi pass `control={form.control}` → strict type mismatch. **Fix 1 dòng**: thêm `TTransformedValues = TFieldValues` vào FormField wrapper.

### 6. Cascade delete order

Khi xóa workspace có nhiều projects + tasks:
1. Xóa tasks của mỗi project **trước**
2. Xóa projects của workspace
3. Xóa workspace cuối cùng

Order children → parent giữ state intermediate consistent. Mirror lại FK CASCADE của SQL.

### 7. Server vs Client component boundary

- Landing page = server component (SEO, faster paint)
- Auth pages = server, form bên trong = client
- Dashboard layout = server, nhưng wrap với `<AuthGuard>` (client) để gate
- Provider chain mount inside dashboard layout → landing/auth không gánh hydration cost

### 8. URL-backed state

Thay vì `useState` cho filter / sort, dùng URL query params:
- Refresh giữ state
- Share link preserve view
- Browser back navigates filter changes
- Không cần sync nhiều client states

---

## 🗺 Roadmap (future work)

- [ ] Real backend (Postgres + Prisma + tRPC)
- [ ] Real-time multi-user collaboration (PartyKit / Yjs)
- [ ] Recurring tasks
- [ ] File attachments
- [ ] @mention assignee với notification
- [ ] Mobile app (Expo) sharing the design tokens
- [ ] Onboarding tour (Joyride)
- [ ] Test suite (Vitest + Playwright)

---

## 📄 License

MIT — free for personal & portfolio use.

## 🙏 Credits

- Inspired by [Linear](https://linear.app), [Notion](https://notion.so), [Height](https://height.app)
- UI primitives: [shadcn/ui](https://ui.shadcn.com) (Radix)
- Icons: [Lucide](https://lucide.dev)
- Fonts: [Geist](https://vercel.com/font)
