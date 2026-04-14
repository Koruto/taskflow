<div align="center">

<svg xmlns="http://www.w3.org/2000/svg" width="72" height="69" fill="none" viewBox="0 0 48 46"><path fill="#863bff" d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" style="fill:#863bff;fill-opacity:1"/></svg>

# Taskflow

**A minimal but real task management system — built for the TaskFlow engineering take-home.**

React · TypeScript · Vite · Tailwind CSS · shadcn/ui · MSW

</div>

---

## 1. Overview

Taskflow lets users register, log in, create projects, and manage tasks within those projects. Tasks have statuses (`todo`, `in_progress`, `in_review`, `done`), priorities, assignees, and due dates. A drag-and-drop Kanban board and a sortable table list view are both available.

**Tech stack (Frontend-only submission):**

| Layer             | Choice                                                      |
| ----------------- | ----------------------------------------------------------- |
| Framework         | React 19 + TypeScript                                       |
| Build             | Vite                                                        |
| Styling           | Tailwind CSS v4                                             |
| Components        | shadcn/ui (Radix UI primitives)                             |
| Routing           | React Router v7                                             |
| Mock API          | Mock Service Worker (MSW) — browser-intercepted fetch calls |
| Drag-and-drop     | @dnd-kit                                                    |
| Forms             | react-hook-form + Zod                                       |
| State persistence | localStorage (`taskflow.mock.db`)                           |

---

## 2. Architecture Decisions

### Mock API via MSW

Rather than shipping a real backend, all HTTP calls are intercepted in the browser by MSW. Handlers live in `src/lib/api/msw/handlers.ts` and a localStorage-backed store in `src/lib/api/msw/store.ts` mimics a real PostgreSQL database. This means:

- Zero extra processes to run — `npm run dev` is the entire setup.
- The mock respects the same REST contract as Appendix A, so swapping to a real backend only requires changing `VITE_API_BASE_URL`.

### Seed data strategy

Demo data is generated **relative to the current date** on first load and re-seeded automatically after 7 days (or on version bumps). Active sessions are preserved across re-seeds so logged-in users stay logged in. This prevents stale due dates for reviewers.

### Client-side API layer

`src/lib/api/taskflow.ts` is a thin typed wrapper over `fetch`. It throws `ApiError` on non-2xx responses so every caller can handle specific status codes (e.g. 404 → not-found UI, 401 → auto-logout).

### Optimistic drag-and-drop

Board column drops commit to the UI immediately (full task-array snapshot swap), then fire a `PATCH /tasks/:id` request in the background. On failure the snapshot is restored and an inline banner surfaces the error. Creating/editing tasks is not optimistic — the dialog stays in a saving state until the round-trip completes; for this scope that felt like the right tradeoff.

### What was intentionally left out

- **Project / task delete UI** — the API endpoints exist in MSW but there are no delete buttons in the UI. Given time I'd add a context menu or a delete confirmation dialog.
- **Pagination** — all list endpoints return everything. With many tasks the dashboard table would become unwieldy.
- **WebSocket / SSE real-time** — not possible without a real backend.
- **Optimistic create/edit** — the dialog waits for the API. An optimistic approach would feel snappier but complicates error handling.

---

## 3. Running Locally

### With Docker (recommended)

Assumes Docker Desktop is installed. No other tools required.

```bash
git clone https://github.com/your-name/taskflow
cd taskflow
docker compose up
```

The app is available at **http://localhost:5173**.

The container runs the Vite dev server with `--host` so Mock Service Worker starts up as normal — no real backend required.

> `.env.example` documents the available variables. All defaults are already baked into `docker-compose.yml` so copying it is only needed if you want to override a value.

### Without Docker

```bash
git clone https://github.com/your-name/taskflow
cd taskflow
npm install
npm run dev
```

Open **http://localhost:5173** in your browser. The MSW service worker registers on first load (you will see a `[MSW] Mocking enabled` message in the browser console).

Optional: copy `.env.example` to `.env` and set `VITE_API_BASE_URL` if you want to point the client at a real backend instead of the default mock origin.

---

## 4. Running Migrations

This is a frontend-only submission — there is no database or migration toolchain. All data is stored in localStorage via the MSW mock. No migration step is needed.

If you want a clean slate, open DevTools → Application → Local Storage → delete the `taskflow.mock.db` key and refresh. The demo seed will regenerate with fresh relative dates.

---

## 5. Test Credentials

The login screen has a **"Login as demo user"** button — click it to get in immediately without typing anything.

Alternatively, use the seeded credentials manually:

| Name                | Email                | Password      |
| ------------------- | -------------------- | ------------- |
| Alex Rivera _(you)_ | `test@example.com`   | `password123` |
| Jamie Chen          | `jamie@example.com`  | `password123` |
| Sam Patel           | `sam@example.com`    | `password123` |
| Morgan Lee          | `morgan@example.com` | `password123` |
| Taylor Brooks       | `taylor@example.com` | `password123` |

Four additional team members are pre-seeded and appear in the assignee dropdowns (`jamie@example.com`, `sam@example.com`, `morgan@example.com`, `taylor@example.com` — all with `password123`), so you can log in as any of them to see the app from a different perspective.

---

## 6. API Reference

The app uses **Mock Service Worker (MSW)** — there is no real server. All `fetch` calls to `http://localhost:4000` are intercepted in the browser by the service worker defined in `src/lib/api/msw/handlers.ts`.

Mock data is persisted in **localStorage** under the key `taskflow.mock.db`. Clearing that key (DevTools → Application → Local Storage) resets everything back to the seeded state.

The full request/response contract follows **Appendix A** of the assignment spec exactly, including all auth, project, and task endpoints, error shapes, and status codes.

---

## 7. What I'd Do With More Time

### Shortcuts I took

**Using AI heavily and prioritising visual feedback over code review.** I leaned on Cursor/AI throughout and spent more time checking whether features looked and felt right than reading the generated code carefully. That worked well for shipping a polished UI quickly, but it left behind inconsistencies I wouldn't have accepted in a normal review, colours and font sizes were decided upfront but not fully enforced, so there are places where hardcoded values crept in instead of using the design tokens consistently, especially in the dark theme where contrast is noticeably off in several spots.

**Scope creep on presentation.** I added the Dashboard (weekly task view, stat cards, due-this-week table) when in hindsight a tighter scope would have served me better. Dropping it and keeping just Projects + Tasks would have given me more time to review the code I was shipping, catch those inconsistencies, and think more carefully about error states. Because I was against a mock server rather than a real backend, error handling was never really stressed. I implemented the states but never truly exercised them the way a real network and real failures would have.

The flip side is that this approach produced something that genuinely looks and feels like a product, and I ended up with more working features than I would have taken a slower, more methodical route.

### What I'd fix first

**Dark mode.** The light theme is solid, but the dark mode has multiple contrast issues, text that's too dim against dark backgrounds, borders that disappear, and a few components that clearly weren't checked in dark at all. This would be my first pass — going screen by screen with a contrast checker and tightening the token usage.

**Project and task delete.** The MSW endpoints are fully wired (`DELETE /projects/:id` and `DELETE /tasks/:id` both work correctly), but I never added the UI trigger. A simple confirmation dialog or a context menu on the card would close this gap.

**Design consistency.** Audit and replace all hardcoded colour and spacing values with the right tokens, enforce the type scale properly, and make sure the same component patterns are used in equivalent situations across the app.

### What I'd add

**Pagination.** Everything currently returns all records. With real data volumes the dashboard table and board columns would become unusable. `?page=&limit=` on list endpoints is straightforward to add.

**Real-time updates.** I'm curious about WebSocket or SSE here, not because it's strictly necessary for a task manager, but because it's an interesting engineering problem I'd like to work through properly with a real backend behind it.

---

## Project Layout

```
src/
├── components/
│   ├── brand/          # TaskflowLogo SVG component
│   ├── layout/         # AppShell, sidebar, bottom nav
│   ├── project-detail/ # Board, list, task card, task dialog
│   └── ui/             # shadcn/ui primitives
├── lib/
│   └── api/
│       ├── msw/        # MSW handlers + localStorage store
│       ├── taskflow.ts # Typed fetch wrapper
│       └── auth.ts     # Session helpers
└── pages/              # Route-level page components
```

## Scripts

| Command             | Purpose                                                                |
| ------------------- | ---------------------------------------------------------------------- |
| `npm run dev`       | Vite dev server + MSW mock API in the browser                          |
| `npm run build`     | Production build                                                       |
| `docker compose up` | Vite dev server in a container (same MSW mock, no real backend needed) |
