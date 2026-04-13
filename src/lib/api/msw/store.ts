/** Persisted mock "database" (localStorage). */

export const MOCK_DB_STORAGE_KEY = "taskflow.mock.db"

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
}

function isoLocalDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function seedDemo(): MockDb {
  const demoUser: MockUser = {
    id: "u-demo",
    name: "Demo User",
    email: "test@example.com",
    password: "password123",
    created_at: new Date().toISOString(),
  }
  const demoProject: MockProject = {
    id: "p-demo",
    name: "Website Redesign",
    description:
      "Q2 redesign of the company website with modern UI/UX improvements.",
    owner_id: demoUser.id,
    created_at: new Date().toISOString(),
  }
  const demoProjectB: MockProject = {
    id: "p-demo-b",
    name: "Mobile App",
    description: "Companion iOS and Android clients for Taskflow.",
    owner_id: demoUser.id,
    created_at: new Date().toISOString(),
  }

  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const dow = today.getDay()
  const daysToSunday = dow === 0 ? 0 : 7 - dow

  const addDays = (base: Date, n: number) => {
    const x = new Date(base)
    x.setDate(x.getDate() + n)
    return x
  }

  const dueOn = (offsetFromToday: number) => isoLocalDate(addDays(today, offsetFromToday))

  const weekTaskSpecs: {
    title: string
    description: string
    status: string
    priority: string
    project_id: string
    dayOffset: number
    assignee_id: string | null
  }[] = [
    {
      title: "Design homepage mockups",
      description: "Wireframes and high-fidelity mockups for the landing page.",
      status: "done",
      priority: "high",
      project_id: demoProject.id,
      dayOffset: 0,
      assignee_id: demoUser.id,
    },
    {
      title: "Review navigation patterns",
      description: "Align IA with the new sitemap.",
      status: "in_review",
      priority: "medium",
      project_id: demoProject.id,
      dayOffset: 0,
      assignee_id: demoUser.id,
    },
    {
      title: "Implement hero section",
      description: "Build the above-the-fold layout in the design system.",
      status: "in_progress",
      priority: "high",
      project_id: demoProject.id,
      dayOffset: 1,
      assignee_id: demoUser.id,
    },
    {
      title: "Copy review — pricing page",
      description: "Legal and marketing sign-off on tier names.",
      status: "todo",
      priority: "medium",
      project_id: demoProject.id,
      dayOffset: 1,
      assignee_id: null,
    },
    {
      title: "Analytics event map",
      description: "List gtag events for the launch funnel.",
      status: "in_progress",
      priority: "low",
      project_id: demoProjectB.id,
      dayOffset: 2,
      assignee_id: demoUser.id,
    },
    {
      title: "Dark mode QA pass",
      description: "Screenshots and contrast checks across pages.",
      status: "in_review",
      priority: "medium",
      project_id: demoProject.id,
      dayOffset: 2,
      assignee_id: null,
    },
    {
      title: "API integration checklist",
      description: "Verify endpoints used by the new dashboard.",
      status: "todo",
      priority: "high",
      project_id: demoProjectB.id,
      dayOffset: 3,
      assignee_id: demoUser.id,
    },
    {
      title: "Performance budget",
      description: "Core Web Vitals targets for release.",
      status: "in_progress",
      priority: "low",
      project_id: demoProject.id,
      dayOffset: 4,
      assignee_id: demoUser.id,
    },
    {
      title: "Stakeholder demo dry run",
      description: "Rehearse the launch narrative.",
      status: "todo",
      priority: "medium",
      project_id: demoProject.id,
      dayOffset: 4,
      assignee_id: null,
    },
    {
      title: "Ship checklist sign-off",
      description: "Final green light before tagging the release.",
      status: "todo",
      priority: "high",
      project_id: demoProject.id,
      dayOffset: 5,
      assignee_id: demoUser.id,
    },
    {
      title: "Post-launch smoke tests",
      description: "Automated suite against production.",
      status: "in_progress",
      priority: "medium",
      project_id: demoProjectB.id,
      dayOffset: 6,
      assignee_id: demoUser.id,
    },
  ].filter((row) => row.dayOffset <= daysToSunday)

  const demoTasks: MockTask[] = []
  let ti = 1
  const ts = new Date().toISOString()
  for (const row of weekTaskSpecs) {
    demoTasks.push({
      id: `t-demo-${ti}`,
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      project_id: row.project_id,
      assignee_id: row.assignee_id,
      due_date: dueOn(row.dayOffset),
      creator_id: demoUser.id,
      created_at: ts,
      updated_at: ts,
    })
    ti += 1
  }

  demoTasks.push(
    {
      id: `t-demo-${ti}`,
      title: "Accessibility audit",
      description: "Run automated and manual a11y checks (backlog).",
      status: "todo",
      priority: "medium",
      project_id: demoProject.id,
      assignee_id: null,
      due_date: null,
      creator_id: demoUser.id,
      created_at: ts,
      updated_at: ts,
    },
    {
      id: `t-demo-${ti + 1}`,
      title: "Quarterly roadmap draft",
      description: "Outline themes for next quarter.",
      status: "todo",
      priority: "low",
      project_id: demoProjectB.id,
      assignee_id: demoUser.id,
      due_date: isoLocalDate(addDays(today, 45)),
      creator_id: demoUser.id,
      created_at: ts,
      updated_at: ts,
    }
  )

  return {
    users: [demoUser],
    projects: [demoProject, demoProjectB],
    tasks: demoTasks,
    sessions: {},
  }
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
    return {
      users: parsed.users,
      projects: parsed.projects,
      tasks: parsed.tasks,
      sessions: parsed.sessions as Record<string, string>,
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
