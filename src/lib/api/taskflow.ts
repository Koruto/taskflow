import { apiRequest } from "@/lib/api/client"
import type { AuthUser, Project, Task, TaskPriority, TaskStatus, TaskWithProjectMeta } from "@/types"

type CreateProjectInput = {
  name: string
  description?: string
}

type UpdateProjectInput = Partial<Pick<CreateProjectInput, "name" | "description">>

type CreateTaskInput = {
  title: string
  description?: string
  status?: TaskStatus
  priority: TaskPriority
  assignee_id: string | null
  due_date: string | null
}

type UpdateTaskInput = Partial<CreateTaskInput>

function normalizeProject(raw: unknown): Project {
  if (raw === null || typeof raw !== "object") {
    return { id: "", name: "", description: undefined, owner_id: "", created_at: "" }
  }
  const o = raw as Record<string, unknown>
  const desc = o.description
  const description =
    typeof desc === "string" ? desc : desc === null || desc === undefined ? undefined : String(desc)
  return {
    id: String(o.id ?? ""),
    name: String(o.name ?? o.title ?? o.project_name ?? ""),
    description,
    owner_id: String(o.owner_id ?? o.ownerId ?? ""),
    created_at: String(o.created_at ?? o.createdAt ?? ""),
  }
}

function extractProjectsArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload
  }
  if (payload !== null && typeof payload === "object") {
    const o = payload as Record<string, unknown>
    if (Array.isArray(o.projects)) {
      return o.projects
    }
    if (Array.isArray(o.data)) {
      return o.data
    }
    const data = o.data
    if (data !== null && typeof data === "object") {
      const inner = data as Record<string, unknown>
      if (Array.isArray(inner.projects)) {
        return inner.projects
      }
    }
  }
  return []
}

export async function listProjects(): Promise<{ projects: Project[] }> {
  const payload = await apiRequest<unknown>("/projects")
  return { projects: extractProjectsArray(payload).map(normalizeProject) }
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const raw = await apiRequest<unknown>("/projects", {
    method: "POST",
    body: JSON.stringify(input),
  })
  if (raw !== null && typeof raw === "object" && "project" in raw) {
    return normalizeProject((raw as { project: unknown }).project)
  }
  return normalizeProject(raw)
}

export async function updateProject(projectId: string, input: UpdateProjectInput): Promise<Project> {
  const raw = await apiRequest<unknown>(`/projects/${projectId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
  if (raw !== null && typeof raw === "object" && "project" in raw) {
    return normalizeProject((raw as { project: unknown }).project)
  }
  return normalizeProject(raw)
}

export async function getProject(projectId: string): Promise<Project & { tasks: Task[] }> {
  const raw = await apiRequest<unknown>(`/projects/${projectId}`)
  if (raw === null || typeof raw !== "object") {
    return {
      id: projectId,
      name: "",
      description: undefined,
      owner_id: "",
      created_at: "",
      tasks: [],
    }
  }
  const o = raw as Record<string, unknown>
  const inner = o.project !== null && typeof o.project === "object" ? (o.project as Record<string, unknown>) : null
  const base = inner ?? o
  const taskList = Array.isArray(o.tasks)
    ? o.tasks
    : Array.isArray(base.tasks)
      ? base.tasks
      : []
  return { ...normalizeProject(base), tasks: taskList as Task[] }
}

export function listProjectTasks(
  projectId: string,
  filters: { status?: TaskStatus; assignee?: string } = {}
): Promise<{ tasks: Task[] }> {
  const params = new URLSearchParams()
  if (filters.status) {
    params.set("status", filters.status)
  }
  if (filters.assignee) {
    params.set("assignee", filters.assignee)
  }
  const query = params.toString()
  return apiRequest(`/projects/${projectId}/tasks${query ? `?${query}` : ""}`)
}

export function createTask(projectId: string, input: CreateTaskInput): Promise<Task> {
  return apiRequest(`/projects/${projectId}/tasks`, {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function updateTask(taskId: string, input: UpdateTaskInput): Promise<Task> {
  return apiRequest(`/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export function listUsers(): Promise<{ users: AuthUser[] }> {
  return apiRequest("/users")
}

/** Tasks assigned to a user across all visible projects, with project names. */
export async function listTasksAssignedToUser(userId: string): Promise<{ tasks: TaskWithProjectMeta[] }> {
  const { projects } = await listProjects()
  const tasks: TaskWithProjectMeta[] = []
  for (const project of projects) {
    const full = await getProject(project.id)
    for (const task of full.tasks) {
      if (task.assignee_id === userId) {
        tasks.push({ ...task, project_name: project.name })
      }
    }
  }
  return { tasks }
}
