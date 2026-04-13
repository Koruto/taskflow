# TaskFlow — Frontend Plan of Action

This document turns the [Taskflow.md](./Taskflow.md) frontend requirements into an ordered plan: what to build, concrete steps, and **why** each decision matters for the assignment rubric (correctness, UI/UX, component design, README).

---

## 1. Goal

Ship a **complete** React (TypeScript) client that satisfies the frontend rubric: authentication with persisted JWT, protected routing, all required views, visible loading/error/empty states, optimistic updates for task status, responsive layout (375px and 1280px), and no console errors in production builds.

---

## 2. Scope (from the brief)

| Area | Requirement |
|------|----------------|
| **Pages** | Login / Register, projects list, project detail (tasks + filters), task create/edit (modal or panel), navbar (user name + logout) |
| **Routing** | React Router; protected routes → redirect to `/login` when unauthenticated |
| **State** | Auth survives refresh (e.g. `localStorage`); optimistic UI for **task status** changes |
| **UX** | Loading and error states must never be silent; sensible empty states |
| **Design** | Component library **or** custom components — document the choice in README; polished, responsive |

**Full-stack vs frontend-only**

- If the real Go API exists: point the client at it (typically via `VITE_API_URL` or proxy in Vite).
- If you are **frontend-only**: implement Appendix A against `http://localhost:4000` using **json-server**, **MSW**, or similar, and document how to run the mock in the README.

Reasoning: the rubric grades “does it run end-to-end” for your chosen path; ambiguity here is a common failure mode, so the README must state one path clearly.

---

## 3. Current codebase (baseline)

- **Stack**: Vite, React 19, TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`).
- **Gaps vs assignment**: no React Router, no auth layer, no API client, no UI kit decision yet.

Reasoning: Tailwind is already chosen for styling; adding a library that composes well with Tailwind (e.g. shadcn/ui + Radix) avoids fighting the stack; alternatively, custom components keep dependencies minimal at the cost of more implementation time.

---

## 4. Recommended architecture (high level)

1. **API layer**: a small `fetch` (or axios) wrapper that attaches `Authorization: Bearer <token>`, parses JSON, and maps HTTP errors to a consistent shape (`401` → clear session, `400` → show `fields`, etc.).
2. **Auth context**: holds `user`, `token`, login/register/logout, persists token + minimal user info, provides `isAuthenticated`.
3. **Route layout**: public routes (`/login`, `/register`) vs protected shell (navbar + `<Outlet />`).
4. **Server state**: TanStack Query (React Query) is optional but strongly justified — caching, refetch after mutations, and error/retry handling align with “loading/error must be visible” and reduce ad hoc `useEffect` chains.

Reasoning: separation of “HTTP + auth” from “screens” matches the rubric’s “separation of concerns” and makes the app explainable in a review call.

---

## 5. Phased plan

### Phase A — Foundation

| Step | Action | Reasoning |
|------|--------|-----------|
| A1 | Add **React Router** and define route table (`/`, `/login`, `/register`, `/projects`, `/projects/:id`, optional catch-all → 404). | Required by spec; central place for protected-route logic. |
| A2 | Add **path alias** (e.g. `@/`) in `tsconfig` + Vite if not present. | Keeps imports stable as the tree grows. |
| A3 | Choose and install **UI primitives**: e.g. shadcn/ui (Radix + Tailwind) **or** Radix-only **or** headless + your styles. | Spec allows either; pick one and stick to it for consistency. |
| A4 | Add **forms + validation**: React Hook Form + Zod (or equivalent) for login/register and task forms. | Maps cleanly to `400` + `fields` from the API; avoids one-off validation bugs. |
| A5 | Environment: `VITE_API_BASE_URL` (default `http://localhost:4000` for mock or your API port). | Same client code for mock vs real API; README documents one command. |

### Phase B — Authentication

| Step | Action | Reasoning |
|------|--------|-----------|
| B1 | Implement **auth API** functions: `POST /auth/register`, `POST /auth/login` per Appendix A / backend spec. | Single source of truth for request/response shapes. |
| B2 | **Persist** JWT (and optionally user snapshot) in `localStorage`; restore on app load. | Explicit requirement; enables refresh without re-login. |
| B3 | **Protected route** component: if no token, redirect to `/login` (preserve `returnUrl` optional bonus). | Required behavior; prevents flashing protected content — use a short “restoring session” state if needed. |
| B4 | **Logout**: clear storage + navigate to `/login`. | Navbar requirement. |
| B5 | Handle **401** globally: clear auth and redirect (or show toast + redirect). | Prevents stuck “logged in” UI when token expires. |

### Phase C — Projects

| Step | Action | Reasoning |
|------|--------|-----------|
| C1 | **Projects list** page: `GET /projects`, create button → modal/page → `POST /projects`. | Core flow; test “empty list” and “many projects”. |
| C2 | Loading skeleton or spinner; **error banner** or inline alert on failure. | Rubric: no silent failures. |
| C3 | Empty state copy + CTA (“Create your first project”) instead of blank area. | Rubric: no blank white boxes. |

### Phase D — Project detail & tasks

| Step | Action | Reasoning |
|------|--------|-----------|
| D1 | **Project detail**: `GET /projects/:id` including nested `tasks` (or merge with `GET /projects/:id/tasks` if you split calls). | Must show tasks; choose one loading strategy and document it. |
| D2 | **Filters**: `status` and `assignee` — URL query params (`?status=&assignee=`) or local state; if local, still call API with query params when using the dedicated tasks list endpoint. | Spec requires filtering; URL params improve shareability and reviewability. |
| D3 | **Task list UI**: grouped by status (columns or sections) or flat list with badges — either is fine if filters work. | Clarity beats novelty; grouping can mimic “boards” without DnD. |
| D4 | **Task create/edit** in a **modal** or **side panel**: title, description, status, priority, assignee, due date. | Required; modal keeps context on project page. |
| D5 | **Assignee dropdown**: needs a list of users — the mock spec does not define `GET /users`; **decision required**: mock a small users list in MSW/json-server, or derive assignees from project tasks + current user, or document a minimal extra endpoint if you control the backend. | Common gap in frontend-only setups; document the workaround in README. |

### Phase E — Optimistic updates (task status)

| Step | Action | Reasoning |
|------|--------|-----------|
| E1 | On status change (select, drag-less button, or column move), **update UI immediately**. | Required optimistic UX. |
| E2 | Fire `PATCH /tasks/:id` with `{ status }`; on **failure**, **revert** UI and show error. | Completes the optimistic contract; TanStack Query’s `onMutate` / `onError` pattern fits well. |
| E3 | Ensure `updated_at` or list order stays consistent after refetch (optional refetch on settle). | Avoids subtle desync between optimistic row and server truth. |

### Phase F — Navbar & shell

| Step | Action | Reasoning |
|------|--------|-----------|
| F1 | Top **navbar**: app name/link home, **logged-in user name**, **logout**. | Explicit checklist item. |
| F2 | Responsive: collapse menu (hamburger) or wrap at 375px if needed. | Required breakpoints. |

### Phase G — Responsive & polish

| Step | Action | Reasoning |
|------|--------|-----------|
| G1 | Test at **375px** and **1280px**: typography, tap targets, modals full-screen on small widths if needed. | Rubric item. |
| G2 | **Production build**: `npm run build` + `npm run preview`; fix **console errors** (and warnings that fail CI if you add strict lint). | Automatic disqualifier mentions console errors in prod build. |
| G3 | Focus states, aria labels on icon buttons, form labels. | Professional polish; often discussed in review. |

### Phase H — Mock API (frontend-only path)

| Step | Action | Reasoning |
|------|--------|-----------|
| H1 | Stand up **json-server** or **MSW** with routes matching Appendix A (including `Authorization` checks for protected routes). | Reviewers can run `docker compose up` or `npm run mock` with zero ambiguity. |
| H2 | Seed JSON with **projects**, **tasks**, and **users** so filters and assignees work. | Unlocks realistic demos without manual POST spam. |

### Phase I — Docker & README (repo-level, affects frontend)

| Step | Action | Reasoning |
|------|--------|-----------|
| I1 | Frontend **Dockerfile** multi-stage: `npm ci` → `npm run build` → nginx or static serve (aligned with full-stack deliverable). | Global assignment requirement for API Dockerfile; frontend image often mirrors “build + minimal runtime”. |
| I2 | **README**: component library choice, how env vars work, mock vs real API, test credentials if using seed. | README is scored; ties frontend decisions to reviewer steps. |

---

## 6. Dependency decisions (summary)

| Topic | Suggestion | Why |
|-------|------------|-----|
| Router | `react-router` v6+ | Spec requirement; industry default. |
| Server state | TanStack Query | Fewer bugs around loading/error/cache; easier optimistic flows. |
| Forms | RHF + Zod | Structured validation + API `fields` mapping. |
| UI | shadcn/ui + Tailwind **or** custom + Radix | You already use Tailwind; shadcn is a common “polished” choice; custom is fine if time-boxed. |
| Icons | lucide-react (if shadcn) or similar | Small, consistent set. |

---

## 7. Rubric alignment checklist

- [ ] Register → login → JWT stored → refresh still authenticated  
- [ ] Direct visit to `/projects` when logged out → `/login`  
- [ ] Projects list + create project  
- [ ] Project detail + tasks + **status** and **assignee** filters  
- [ ] Task create/edit with all fields  
- [ ] Navbar: name + logout  
- [ ] Loading / error / empty states everywhere data is fetched  
- [ ] Task **status** change is optimistic with revert on error  
- [ ] 375px and 1280px usable  
- [ ] Production build without console errors  
- [ ] README states UI stack and how to run (especially mock API for FE-only)  

---

## 8. Optional bonuses (pick if time allows)

- Drag-and-drop for reorder or status columns  
- **Dark mode** + persistence (`localStorage` + `prefers-color-scheme` optional default)  
- WebSocket/SSE (only if backend exists — out of scope for mock-only unless faked)  

---

## 9. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| No user directory for assignees | Document mock users or minimal `GET /users` in mock server. |
| Token expiry during demo | Show friendly “session expired” on 401; easy re-login. |
| Over-engineering | Deliver vertical slices (auth → one project → tasks) before extras. |

---

## 10. Suggested order of execution

1. Router + layout shell + placeholder pages  
2. Auth (API + persistence + protected routes)  
3. Projects list + create  
4. Project detail + task list + filters  
5. Task modal + mutations + optimistic status  
6. Responsive pass + empty states + error UX  
7. Mock stack (if FE-only) + Docker/README  

This order maximizes **working demos early** and keeps the highest-risk integration (auth + optimistic tasks) in the middle when momentum is strongest.
