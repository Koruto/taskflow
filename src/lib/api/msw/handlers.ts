import { http, HttpResponse } from "msw"

import { getApiBaseUrl } from "@/lib/env"

import {
  loadDb,
  saveDb,
  type MockDb,
  type MockProject,
  type MockTask,
  type MockUser,
  toSafeUser,
} from "./store"

function apiUrl(path: string): string {
  const base = getApiBaseUrl().replace(/\/$/, "")
  const p = path.startsWith("/") ? path : `/${path}`
  return `${base}${p}`
}

function getBearerToken(request: Request): string {
  const header = request.headers.get("authorization") ?? ""
  return header.startsWith("Bearer ") ? header.slice(7) : ""
}

function makeToken(userId: string): string {
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
  return `mock-token-${userId}-${hex}`
}

function validateRequired(
  fields: Record<string, unknown>
): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const [key, value] of Object.entries(fields)) {
    if (!value || String(value).trim() === "") {
      errors[key] = "is required"
    }
  }
  return errors
}

function unauthorized() {
  return HttpResponse.json({ error: "unauthorized" }, { status: 401 })
}

function authUser(db: MockDb, request: Request): MockUser | null {
  const token = getBearerToken(request)
  if (!token) {
    return null
  }
  const userId = db.sessions[token]
  if (!userId) {
    return null
  }
  return db.users.find((u) => u.id === userId) ?? null
}

const allowedStatuses = new Set(["todo", "in_progress", "done"])

export const handlers = [
  http.get(apiUrl("/health"), () => HttpResponse.json({ ok: true })),

  http.post(apiUrl("/auth/register"), async ({ request }) => {
    const db = loadDb()
    const body = (await request.json()) as Record<string, unknown>
    const name = body.name
    const email = body.email
    const password = body.password
    const fields = validateRequired({ name, email, password })
    if (Object.keys(fields).length > 0) {
      return HttpResponse.json({ error: "validation failed", fields }, { status: 400 })
    }
    if (
      db.users.some(
        (u) => u.email.toLowerCase() === String(email).toLowerCase()
      )
    ) {
      return HttpResponse.json(
        { error: "validation failed", fields: { email: "already exists" } },
        { status: 400 }
      )
    }
    const user: MockUser = {
      id: crypto.randomUUID(),
      name: String(name),
      email: String(email),
      password: String(password),
      created_at: new Date().toISOString(),
    }
    db.users.push(user)
    const token = makeToken(user.id)
    db.sessions[token] = user.id
    saveDb(db)
    return HttpResponse.json(
      { token, user: toSafeUser(user) },
      { status: 201 }
    )
  }),

  http.post(apiUrl("/auth/login"), async ({ request }) => {
    const db = loadDb()
    const body = (await request.json()) as Record<string, unknown>
    const email = body.email
    const password = body.password
    const fields = validateRequired({ email, password })
    if (Object.keys(fields).length > 0) {
      return HttpResponse.json({ error: "validation failed", fields }, { status: 400 })
    }
    const user = db.users.find(
      (u) =>
        u.email.toLowerCase() === String(email).toLowerCase() &&
        u.password === String(password)
    )
    if (!user) {
      return unauthorized()
    }
    const token = makeToken(user.id)
    db.sessions[token] = user.id
    saveDb(db)
    return HttpResponse.json({ token, user: toSafeUser(user) })
  }),

  http.get(apiUrl("/users"), ({ request }) => {
    const db = loadDb()
    const user = authUser(db, request)
    if (!user) {
      return unauthorized()
    }
    return HttpResponse.json({ users: db.users.map(toSafeUser) })
  }),

  http.get(apiUrl("/projects"), ({ request }) => {
    const db = loadDb()
    const user = authUser(db, request)
    if (!user) {
      return unauthorized()
    }
    const visible: MockProject[] = db.projects.filter((project) => {
      if (project.owner_id === user.id) {
        return true
      }
      return db.tasks.some(
        (task) =>
          task.project_id === project.id && task.assignee_id === user.id
      )
    })
    return HttpResponse.json({ projects: visible })
  }),

  http.post(apiUrl("/projects"), async ({ request }) => {
    const db = loadDb()
    const user = authUser(db, request)
    if (!user) {
      return unauthorized()
    }
    const body = (await request.json()) as Record<string, unknown>
    const name = body.name
    const description = typeof body.description === "string" ? body.description : ""
    const fields = validateRequired({ name })
    if (Object.keys(fields).length > 0) {
      return HttpResponse.json({ error: "validation failed", fields }, { status: 400 })
    }
    const project: MockProject = {
      id: crypto.randomUUID(),
      name: String(name),
      description: String(description ?? ""),
      owner_id: user.id,
      created_at: new Date().toISOString(),
    }
    db.projects.push(project)
    saveDb(db)
    return HttpResponse.json(project, { status: 201 })
  }),

  http.get(apiUrl("/projects/:id"), ({ request, params }) => {
    const db = loadDb()
    const user = authUser(db, request)
    if (!user) {
      return unauthorized()
    }
    const id = String(params.id)
    const project = db.projects.find((p) => p.id === id)
    if (!project) {
      return HttpResponse.json({ error: "not found" }, { status: 404 })
    }
    const projectTasks = db.tasks.filter((t) => t.project_id === project.id)
    return HttpResponse.json({
      ...project,
      tasks: projectTasks,
    })
  }),

  http.patch(apiUrl("/projects/:id"), async ({ request, params }) => {
    const db = loadDb()
    const user = authUser(db, request)
    if (!user) {
      return unauthorized()
    }
    const id = String(params.id)
    const project = db.projects.find((p) => p.id === id)
    if (!project) {
      return HttpResponse.json({ error: "not found" }, { status: 404 })
    }
    if (project.owner_id !== user.id) {
      return HttpResponse.json({ error: "forbidden" }, { status: 403 })
    }
    const body = (await request.json()) as Record<string, unknown>
    if (typeof body.name === "string" && body.name.trim()) {
      project.name = body.name
    }
    if (typeof body.description === "string") {
      project.description = body.description
    }
    saveDb(db)
    return HttpResponse.json(project)
  }),

  http.delete(apiUrl("/projects/:id"), ({ request, params }) => {
    const db = loadDb()
    const user = authUser(db, request)
    if (!user) {
      return unauthorized()
    }
    const id = String(params.id)
    const index = db.projects.findIndex((p) => p.id === id)
    if (index === -1) {
      return HttpResponse.json({ error: "not found" }, { status: 404 })
    }
    if (db.projects[index].owner_id !== user.id) {
      return HttpResponse.json({ error: "forbidden" }, { status: 403 })
    }
    const projectId = db.projects[index].id
    db.projects.splice(index, 1)
    for (let i = db.tasks.length - 1; i >= 0; i -= 1) {
      if (db.tasks[i].project_id === projectId) {
        db.tasks.splice(i, 1)
      }
    }
    saveDb(db)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(apiUrl("/projects/:id/tasks"), ({ request, params }) => {
    const db = loadDb()
    const user = authUser(db, request)
    if (!user) {
      return unauthorized()
    }
    const id = String(params.id)
    const project = db.projects.find((p) => p.id === id)
    if (!project) {
      return HttpResponse.json({ error: "not found" }, { status: 404 })
    }
    const url = new URL(request.url)
    let filtered = db.tasks.filter((t) => t.project_id === project.id)
    const statusFilter = url.searchParams.get("status")
    if (statusFilter) {
      filtered = filtered.filter((t) => t.status === statusFilter)
    }
    const assignee = url.searchParams.get("assignee")
    if (assignee) {
      filtered = filtered.filter((t) => t.assignee_id === assignee)
    }
    return HttpResponse.json({ tasks: filtered })
  }),

  http.post(apiUrl("/projects/:id/tasks"), async ({ request, params }) => {
    const db = loadDb()
    const user = authUser(db, request)
    if (!user) {
      return unauthorized()
    }
    const id = String(params.id)
    const project = db.projects.find((p) => p.id === id)
    if (!project) {
      return HttpResponse.json({ error: "not found" }, { status: 404 })
    }
    const body = (await request.json()) as Record<string, unknown>
    const title = body.title
    const fields = validateRequired({ title })
    if (Object.keys(fields).length > 0) {
      return HttpResponse.json({ error: "validation failed", fields }, { status: 400 })
    }
    const description =
      typeof body.description === "string" ? body.description : ""
    const priority =
      typeof body.priority === "string" && body.priority ? body.priority : "medium"
    const assignee_id =
      body.assignee_id === "" || body.assignee_id === undefined
        ? null
        : (body.assignee_id as string | null)
    const due_date =
      body.due_date === null || body.due_date === undefined
        ? null
        : String(body.due_date)
    const requestedStatus =
      typeof body.status === "string" ? body.status : undefined
    const status =
      requestedStatus !== undefined && allowedStatuses.has(requestedStatus)
        ? requestedStatus
        : "todo"
    const task: MockTask = {
      id: crypto.randomUUID(),
      title: String(title),
      description: String(description),
      status,
      priority: String(priority),
      project_id: project.id,
      assignee_id: assignee_id === "" ? null : assignee_id,
      due_date,
      creator_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    db.tasks.push(task)
    saveDb(db)
    return HttpResponse.json(task, { status: 201 })
  }),

  http.patch(apiUrl("/tasks/:id"), async ({ request, params }) => {
    const db = loadDb()
    const user = authUser(db, request)
    if (!user) {
      return unauthorized()
    }
    const id = String(params.id)
    const task = db.tasks.find((t) => t.id === id)
    if (!task) {
      return HttpResponse.json({ error: "not found" }, { status: 404 })
    }
    const body = (await request.json()) as Record<string, unknown>
    const updatableKeys = [
      "title",
      "description",
      "status",
      "priority",
      "assignee_id",
      "due_date",
    ] as const
    for (const key of updatableKeys) {
      if (!Object.prototype.hasOwnProperty.call(body, key)) {
        continue
      }
      let value: unknown = body[key]
      if (key === "assignee_id" && value === "") {
        value = null
      }
      if (key === "status" && typeof value === "string") {
        if (!allowedStatuses.has(value)) {
          return HttpResponse.json(
            {
              error: "validation failed",
              fields: { status: "invalid status" },
            },
            { status: 400 }
          )
        }
      }
      ;(task as Record<string, unknown>)[key] = value
    }
    task.updated_at = new Date().toISOString()
    saveDb(db)
    return HttpResponse.json(task)
  }),

  http.delete(apiUrl("/tasks/:id"), ({ request, params }) => {
    const db = loadDb()
    const user = authUser(db, request)
    if (!user) {
      return unauthorized()
    }
    const id = String(params.id)
    const index = db.tasks.findIndex((t) => t.id === id)
    if (index === -1) {
      return HttpResponse.json({ error: "not found" }, { status: 404 })
    }
    const task = db.tasks[index]
    const proj = db.projects.find((p) => p.id === task.project_id)
    if (!proj) {
      return HttpResponse.json({ error: "not found" }, { status: 404 })
    }
    const canDelete = task.creator_id === user.id || proj.owner_id === user.id
    if (!canDelete) {
      return HttpResponse.json({ error: "forbidden" }, { status: 403 })
    }
    db.tasks.splice(index, 1)
    saveDb(db)
    return new HttpResponse(null, { status: 204 })
  }),
]
