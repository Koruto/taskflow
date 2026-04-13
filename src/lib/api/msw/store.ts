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
  const demoTasks: MockTask[] = [
    {
      id: "t-demo-1",
      title: "Design homepage mockups",
      description: "Wireframes and high-fidelity mockups for the landing page.",
      status: "done",
      priority: "high",
      project_id: "p-demo",
      assignee_id: demoUser.id,
      due_date: "2026-04-15",
      creator_id: demoUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "t-demo-2",
      title: "Review mobile layout",
      description: "Check breakpoints and spacing on small screens.",
      status: "done",
      priority: "medium",
      project_id: "p-demo",
      assignee_id: demoUser.id,
      due_date: "2026-04-18",
      creator_id: demoUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "t-demo-3",
      title: "Ship v1 UI",
      description: "Final polish and release checklist.",
      status: "done",
      priority: "low",
      project_id: "p-demo",
      assignee_id: null,
      due_date: "2026-04-25",
      creator_id: demoUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]
  return {
    users: [demoUser],
    projects: [demoProject],
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
