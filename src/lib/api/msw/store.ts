/** Persisted mock "database" (localStorage). */

export const MOCK_DB_STORAGE_KEY = "taskflow.mock.db"

/** Increment this whenever the seed shape changes — triggers a re-seed on next load. */
const SEED_VERSION = 3

export type MockUser = {
  id: string
  name: string
  email: string
  password: string
  created_at: string
}

export type MockProject = {
  id: string
  name: string
  description: string
  owner_id: string
  created_at: string
}

export type MockTask = {
  id: string
  title: string
  description: string
  status: string
  priority: string
  project_id: string
  assignee_id: string | null
  due_date: string | null
  creator_id: string
  created_at: string
  updated_at: string
}

export type MockDb = {
  users: MockUser[]
  projects: MockProject[]
  tasks: MockTask[]
  /** Maps bearer token → user id */
  sessions: Record<string, string>
  /** ISO timestamp of when the demo seed was generated */
  seeded_at: string
  /** Seed version — allows auto-re-seed when shape changes */
  seed_version: number
}

function isoLocalDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function addDays(base: Date, n: number): Date {
  const x = new Date(base)
  x.setDate(x.getDate() + n)
  return x
}

function seedDemo(): MockDb {
  const now = new Date()
  now.setHours(12, 0, 0, 0)
  const ts = now.toISOString()

  // ── Team members ──────────────────────────────────────────────────────────
  const demoUser: MockUser = {
    id: "u-demo",
    name: "Alex Rivera",
    email: "test@example.com",
    password: "password123",
    created_at: ts,
  }
  const user2: MockUser = {
    id: "u-2",
    name: "Jamie Chen",
    email: "jamie@example.com",
    password: "password123",
    created_at: ts,
  }
  const user3: MockUser = {
    id: "u-3",
    name: "Sam Patel",
    email: "sam@example.com",
    password: "password123",
    created_at: ts,
  }
  const user4: MockUser = {
    id: "u-4",
    name: "Morgan Lee",
    email: "morgan@example.com",
    password: "password123",
    created_at: ts,
  }
  const user5: MockUser = {
    id: "u-5",
    name: "Taylor Brooks",
    email: "taylor@example.com",
    password: "password123",
    created_at: ts,
  }

  const allUsers = [demoUser, user2, user3, user4, user5]

  // ── Projects ──────────────────────────────────────────────────────────────
  const projectWebsite: MockProject = {
    id: "p-website",
    name: "Website Redesign",
    description:
      "Complete overhaul of the marketing website with a refreshed visual identity, improved conversion funnels, and a fully responsive layout targeting Core Web Vitals green.",
    owner_id: demoUser.id,
    created_at: isoLocalDate(addDays(now, -30)),
  }
  const projectMobile: MockProject = {
    id: "p-mobile",
    name: "Mobile App v2",
    description:
      "Companion iOS and Android clients built with React Native. Covers task management, push notifications, and offline sync.",
    owner_id: demoUser.id,
    created_at: isoLocalDate(addDays(now, -20)),
  }
  const projectInfra: MockProject = {
    id: "p-infra",
    name: "Platform Infrastructure",
    description:
      "Migrate services to Kubernetes, set up observability (Prometheus + Grafana), and harden the CI/CD pipeline.",
    owner_id: user2.id,
    created_at: isoLocalDate(addDays(now, -14)),
  }

  // ── Helper to build a due date ─────────────────────────────────────────────
  const dueOn = (offsetDays: number) => isoLocalDate(addDays(now, offsetDays))

  // ── Tasks ─────────────────────────────────────────────────────────────────
  type TaskSpec = {
    id: string
    title: string
    description: string
    status: string
    priority: string
    project_id: string
    assignee_id: string | null
    due_date: string | null
  }

  const taskSpecs: TaskSpec[] = [
    // ── Website Redesign ──────────────────────────────────────────────────
    {
      id: "t-w1",
      title: "Audit current site performance",
      description:
        "Run Lighthouse and WebPageTest against production. Document LCP, FID, and CLS baselines before any changes land.",
      status: "done",
      priority: "high",
      project_id: projectWebsite.id,
      assignee_id: user3.id,
      due_date: dueOn(-10),
    },
    {
      id: "t-w2",
      title: "Define new design tokens",
      description:
        "Establish color palette, typography scale, spacing grid, and motion curves. Export from Figma into Tailwind config.",
      status: "done",
      priority: "high",
      project_id: projectWebsite.id,
      assignee_id: user4.id,
      due_date: dueOn(-7),
    },
    {
      id: "t-w3",
      title: "Implement hero section",
      description:
        "Build the above-the-fold layout using the new design system. Includes animated gradient headline and CTA block.",
      status: "in_progress",
      priority: "high",
      project_id: projectWebsite.id,
      assignee_id: demoUser.id,
      due_date: dueOn(1),
    },
    {
      id: "t-w4",
      title: "Pricing page copywriting",
      description:
        "Marketing and legal sign-off on tier names, feature bullets, and CTA labels. Coordinate with brand team.",
      status: "in_progress",
      priority: "medium",
      project_id: projectWebsite.id,
      assignee_id: user2.id,
      due_date: dueOn(2),
    },
    {
      id: "t-w5",
      title: "Responsive QA pass — mobile breakpoints",
      description:
        "Test all page templates at 375 px, 390 px, and 430 px. Log layout issues in the tracker with screenshots.",
      status: "in_review",
      priority: "high",
      project_id: projectWebsite.id,
      assignee_id: user5.id,
      due_date: dueOn(3),
    },
    {
      id: "t-w6",
      title: "Dark mode implementation",
      description:
        "Wire Tailwind's `dark:` variants to a persisted theme toggle. Verify contrast ratios against WCAG AA.",
      status: "in_review",
      priority: "medium",
      project_id: projectWebsite.id,
      assignee_id: user3.id,
      due_date: dueOn(3),
    },
    {
      id: "t-w7",
      title: "Analytics event instrumentation",
      description:
        "Map all conversion events (CTA clicks, form submits, plan selections) to GA4 and Segment.",
      status: "todo",
      priority: "medium",
      project_id: projectWebsite.id,
      assignee_id: demoUser.id,
      due_date: dueOn(5),
    },
    {
      id: "t-w8",
      title: "Accessibility audit",
      description:
        "Run axe-core and manual keyboard navigation tests. Target zero critical violations before launch.",
      status: "todo",
      priority: "medium",
      project_id: projectWebsite.id,
      assignee_id: null,
      due_date: dueOn(7),
    },
    {
      id: "t-w9",
      title: "Launch readiness checklist",
      description:
        "Final sign-off gate: SEO meta, OG tags, sitemap.xml, robots.txt, canonical URLs, and CDN cache rules.",
      status: "todo",
      priority: "high",
      project_id: projectWebsite.id,
      assignee_id: user2.id,
      due_date: dueOn(10),
    },
    // ── Mobile App v2 ─────────────────────────────────────────────────────
    {
      id: "t-m1",
      title: "Navigation architecture spike",
      description:
        "Evaluate React Navigation v7 stack + tab hybrid vs. expo-router file-based routing. Document tradeoffs.",
      status: "done",
      priority: "high",
      project_id: projectMobile.id,
      assignee_id: demoUser.id,
      due_date: dueOn(-5),
    },
    {
      id: "t-m2",
      title: "Offline task sync with CRDT",
      description:
        "Prototype Yjs-based optimistic sync. Tasks edited offline must merge cleanly on reconnect without conflicts.",
      status: "in_progress",
      priority: "high",
      project_id: projectMobile.id,
      assignee_id: user3.id,
      due_date: dueOn(4),
    },
    {
      id: "t-m3",
      title: "Push notification setup",
      description:
        "Integrate Expo Notifications with APNs and FCM. Wire up due-date reminders and assignment alerts.",
      status: "in_progress",
      priority: "medium",
      project_id: projectMobile.id,
      assignee_id: user5.id,
      due_date: dueOn(5),
    },
    {
      id: "t-m4",
      title: "Biometric authentication",
      description:
        "Add Face ID / fingerprint unlock with expo-local-authentication. Fallback to PIN on unsupported devices.",
      status: "todo",
      priority: "medium",
      project_id: projectMobile.id,
      assignee_id: user4.id,
      due_date: dueOn(8),
    },
    {
      id: "t-m5",
      title: "App Store & Play Store assets",
      description:
        "Prepare screenshots (6.9\", 6.5\", 5.5\" iPhone + 12.9\" iPad), feature graphic, and store descriptions.",
      status: "todo",
      priority: "low",
      project_id: projectMobile.id,
      assignee_id: user4.id,
      due_date: dueOn(14),
    },
    {
      id: "t-m6",
      title: "Beta TestFlight release",
      description:
        "Build and distribute internal beta to 20 testers. Collect crash reports via Sentry before wider rollout.",
      status: "todo",
      priority: "high",
      project_id: projectMobile.id,
      assignee_id: demoUser.id,
      due_date: dueOn(18),
    },
    // ── Platform Infrastructure ────────────────────────────────────────────
    {
      id: "t-i1",
      title: "Kubernetes cluster bootstrap",
      description:
        "Provision EKS cluster with managed node groups. Configure IRSA, cluster autoscaler, and external-dns.",
      status: "done",
      priority: "high",
      project_id: projectInfra.id,
      assignee_id: user2.id,
      due_date: dueOn(-8),
    },
    {
      id: "t-i2",
      title: "Helm chart for API service",
      description:
        "Package the Go API as a Helm chart with configurable replicas, HPA, and readiness probes.",
      status: "in_progress",
      priority: "high",
      project_id: projectInfra.id,
      assignee_id: user2.id,
      due_date: dueOn(2),
    },
    {
      id: "t-i3",
      title: "Prometheus + Grafana observability stack",
      description:
        "Deploy kube-prometheus-stack. Build dashboards for API latency p50/p95/p99, error rate, and DB connection pool.",
      status: "in_review",
      priority: "medium",
      project_id: projectInfra.id,
      assignee_id: user3.id,
      due_date: dueOn(4),
    },
    {
      id: "t-i4",
      title: "CI/CD pipeline hardening",
      description:
        "Add SAST scanning (Semgrep), container image signing (cosign), and enforce branch protection rules.",
      status: "in_progress",
      priority: "medium",
      project_id: projectInfra.id,
      assignee_id: user5.id,
      due_date: dueOn(6),
    },
    {
      id: "t-i5",
      title: "Disaster recovery runbook",
      description:
        "Document RTO/RPO targets, backup verification cadence, and step-by-step restore procedures for each service.",
      status: "todo",
      priority: "low",
      project_id: projectInfra.id,
      assignee_id: null,
      due_date: dueOn(21),
    },
    {
      id: "t-i6",
      title: "Cost optimisation review",
      description:
        "Identify over-provisioned resources via AWS Cost Explorer. Right-size RDS instance and reserved instance commitments.",
      status: "todo",
      priority: "low",
      project_id: projectInfra.id,
      assignee_id: user2.id,
      due_date: null,
    },
  ]

  const tasks: MockTask[] = taskSpecs.map((spec) => ({
    ...spec,
    description: spec.description,
    creator_id: demoUser.id,
    created_at: ts,
    updated_at: ts,
  }))

  return {
    users: allUsers,
    projects: [projectWebsite, projectMobile, projectInfra],
    tasks,
    sessions: {},
    seeded_at: now.toISOString(),
    seed_version: SEED_VERSION,
  }
}

/** True when the stored seed is stale (>7 days old) or an older schema version. */
function isSeedStale(db: Partial<MockDb>): boolean {
  if (
    typeof db.seed_version !== "number" ||
    db.seed_version !== SEED_VERSION
  ) {
    return true
  }
  if (!db.seeded_at) return true
  const seededMs = new Date(db.seeded_at).getTime()
  if (Number.isNaN(seededMs)) return true
  const ageDays = (Date.now() - seededMs) / (1000 * 60 * 60 * 24)
  return ageDays > 7
}

export function loadDb(): MockDb {
  try {
    const raw = localStorage.getItem(MOCK_DB_STORAGE_KEY)
    if (!raw) {
      const next = seedDemo()
      saveDb(next)
      return next
    }
    const parsed = JSON.parse(raw) as Partial<MockDb>
    if (
      !Array.isArray(parsed.users) ||
      !Array.isArray(parsed.projects) ||
      !Array.isArray(parsed.tasks) ||
      typeof parsed.sessions !== "object" ||
      parsed.sessions === null
    ) {
      const next = seedDemo()
      saveDb(next)
      return next
    }
    // Re-seed demo data if stale, but preserve active sessions so the user
    // stays logged in across the refresh.
    if (isSeedStale(parsed)) {
      const fresh = seedDemo()
      fresh.sessions = parsed.sessions as Record<string, string>
      saveDb(fresh)
      return fresh
    }
    return {
      users: parsed.users,
      projects: parsed.projects,
      tasks: parsed.tasks,
      sessions: parsed.sessions as Record<string, string>,
      seeded_at: parsed.seeded_at ?? new Date().toISOString(),
      seed_version: parsed.seed_version ?? SEED_VERSION,
    }
  } catch {
    const next = seedDemo()
    saveDb(next)
    return next
  }
}

export function saveDb(db: MockDb): void {
  localStorage.setItem(MOCK_DB_STORAGE_KEY, JSON.stringify(db))
}

export function toSafeUser(user: MockUser): { id: string; name: string; email: string } {
  return { id: user.id, name: user.name, email: user.email }
}
