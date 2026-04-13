export type TaskStatus = "todo" | "in_progress" | "done"
export type TaskPriority = "low" | "medium" | "high"

export type Project = {
  id: string
  name: string
  description?: string
  owner_id: string
  created_at: string
}

export type Task = {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  project_id: string
  assignee_id: string | null
  due_date: string | null
  created_at: string
  updated_at: string
}

/** Task plus project name for cross-project views (e.g. My tasks). */
export type TaskWithProjectMeta = Task & { project_name: string }
