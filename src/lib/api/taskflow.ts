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

export function listProjects(): Promise<{ projects: Project[] }> {
  return apiRequest("/projects")
}

export function createProject(input: CreateProjectInput): Promise<Project> {
  return apiRequest("/projects", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function updateProject(projectId: string, input: UpdateProjectInput): Promise<Project> {
  return apiRequest(`/projects/${projectId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export function getProject(projectId: string): Promise<Project & { tasks: Task[] }> {
  return apiRequest(`/projects/${projectId}`)
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
