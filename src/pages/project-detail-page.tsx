import { type FormEvent, useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ApiError } from "@/lib/api/client"
import {
  createTask,
  getProject,
  listUsers,
  updateProject,
  updateTask,
} from "@/lib/api/taskflow"
import { TASK_STATUS_COLUMNS } from "@/lib/task-status-columns"
import type { AuthUser, Project, Task, TaskPriority, TaskStatus } from "@/types"
import { cn } from "@/lib/utils"
import {
  AlignLeft,
  CalendarDays,
  Filter,
  LayoutGrid,
  List,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
} from "lucide-react"

function formatShortDate(iso: string | null): string {
  if (!iso) {
    return "—"
  }
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function initialsForUser(users: AuthUser[], userId: string | null): string {
  if (!userId) {
    return "?"
  }
  const user = users.find((entry) => entry.id === userId)
  if (!user) {
    return "?"
  }
  const parts = user.name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase()
  }
  return user.name.slice(0, 2).toUpperCase()
}

function priorityChipClass(priority: TaskPriority): string {
  switch (priority) {
    case "high":
      return "bg-red-500/12 text-red-800 dark:text-red-300"
    case "medium":
      return "bg-sky-500/12 text-sky-900 dark:text-sky-200"
    case "low":
      return "bg-slate-200/80 text-slate-700 dark:bg-muted dark:text-muted-foreground"
  }
}

function priorityLabel(priority: TaskPriority): string {
  switch (priority) {
    case "high":
      return "Urgent"
    case "medium":
      return "Normal"
    case "low":
      return "Low"
  }
}

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<AuthUser[]>([])
  const [statusFilter, setStatusFilter] = useState<"" | TaskStatus>("")
  const [assigneeFilter, setAssigneeFilter] = useState("")
  const [taskSearch, setTaskSearch] = useState("")
  const [viewMode, setViewMode] = useState<"board" | "list">("board")
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [taskStatus, setTaskStatus] = useState<TaskStatus>("todo")
  const [priority, setPriority] = useState<TaskPriority>("medium")
  const [assigneeId, setAssigneeId] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const [projectDialogOpen, setProjectDialogOpen] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [isSavingProject, setIsSavingProject] = useState(false)

  const filteredTasks = useMemo(() => {
    const q = taskSearch.trim().toLowerCase()
    return tasks.filter((task) => {
      if (statusFilter && task.status !== statusFilter) {
        return false
      }
      if (assigneeFilter && task.assignee_id !== assigneeFilter) {
        return false
      }
      if (q && !task.title.toLowerCase().includes(q) && !(task.description?.toLowerCase().includes(q) ?? false)) {
        return false
      }
      return true
    })
  }, [tasks, statusFilter, assigneeFilter, taskSearch])

  const stats = useMemo(() => {
    const total = filteredTasks.length
    const done = filteredTasks.filter((task) => task.status === "done").length
    const pct = total === 0 ? 0 : Math.round((done / total) * 100)
    return { total, done, pct }
  }, [filteredTasks])

  async function loadProjectAndTasks() {
    if (!projectId) {
      return
    }
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const [projectResponse, usersResponse] = await Promise.all([getProject(projectId), listUsers()])
      setProject({
        id: projectResponse.id,
        name: projectResponse.name,
        description: projectResponse.description,
        owner_id: projectResponse.owner_id,
        created_at: projectResponse.created_at,
      })
      setTasks(projectResponse.tasks)
      setUsers(usersResponse.users)
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Unable to load project.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadProjectAndTasks()
  }, [projectId])

  function resetTaskForm() {
    setEditingTaskId(null)
    setTitle("")
    setDescription("")
    setTaskStatus("todo")
    setPriority("medium")
    setAssigneeId("")
    setDueDate("")
  }

  function openCreateTaskDialog() {
    resetTaskForm()
    setTaskDialogOpen(true)
  }

  function openEditTaskDialog(task: Task) {
    setEditingTaskId(task.id)
    setTitle(task.title)
    setDescription(task.description ?? "")
    setTaskStatus(task.status)
    setPriority(task.priority)
    setAssigneeId(task.assignee_id ?? "")
    setDueDate(task.due_date ?? "")
    setTaskDialogOpen(true)
  }

  function openProjectDialog() {
    if (!project) {
      return
    }
    setProjectName(project.name)
    setProjectDescription(project.description ?? "")
    setProjectDialogOpen(true)
  }

  async function handleSaveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!projectId) {
      return
    }
    if (!title.trim()) {
      setErrorMessage("Task title is required.")
      return
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      status: taskStatus,
      priority,
      assignee_id: assigneeId || null,
      due_date: dueDate || null,
    }

    setIsSaving(true)
    setErrorMessage(null)
    try {
      if (editingTaskId) {
        const updated = await updateTask(editingTaskId, payload)
        setTasks((current) => current.map((entry) => (entry.id === editingTaskId ? updated : entry)))
      } else {
        const created = await createTask(projectId, payload)
        setTasks((current) => [created, ...current])
      }
      setTaskDialogOpen(false)
      resetTaskForm()
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Unable to save task.")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSaveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!projectId || !projectName.trim()) {
      setErrorMessage("Project name is required.")
      return
    }
    setIsSavingProject(true)
    setErrorMessage(null)
    try {
      const updated = await updateProject(projectId, {
        name: projectName.trim(),
        description: projectDescription.trim(),
      })
      setProject(updated)
      setProjectDialogOpen(false)
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Unable to update project.")
    } finally {
      setIsSavingProject(false)
    }
  }

  async function handleStatusChange(taskId: string, status: TaskStatus) {
    const previous = tasks
    setTasks((current) => current.map((task) => (task.id === taskId ? { ...task, status } : task)))
    try {
      const updated = await updateTask(taskId, { status })
      setTasks((current) => current.map((task) => (task.id === taskId ? updated : task)))
    } catch (error) {
      setTasks(previous)
      setErrorMessage(error instanceof ApiError ? error.message : "Unable to update task status.")
    }
  }

  function tasksForColumn(column: TaskStatus): Task[] {
    return filteredTasks.filter((task) => task.status === column)
  }

  if (!projectId) {
    return (
      <div className="p-4">
        <p className="text-body text-destructive">Project id is missing.</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 px-1 py-1">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-base font-medium text-foreground">{project?.name ?? "Project"}</h1>
            <Button
              aria-label="Edit project"
              className="size-8 shrink-0"
              onClick={openProjectDialog}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Pencil className="size-4" />
            </Button>
          </div>
            <p className="mt-1 max-w-2xl text-body text-muted-foreground">
              {project?.description != null && project.description.trim() !== ""
                ? project.description.trim()
                : "No description yet."}
            </p>
        </div>
        <Button
          className="gap-2 self-start rounded-sm bg-brand text-brand-foreground hover:bg-brand-hover"
          onClick={openCreateTaskDialog}
          type="button"
        >
          <Plus className="size-4" />
          Create new task
        </Button>
      </div>

      <Dialog
        onOpenChange={(open) => {
          setProjectDialogOpen(open)
        }}
        open={projectDialogOpen}
      >
        <DialogContent className="sm:max-w-md [&_input]:rounded-sm [&_select]:rounded-sm [&_textarea]:rounded-sm">
          <form className="grid gap-4" onSubmit={handleSaveProject}>
            <DialogHeader>
              <DialogTitle>Edit project</DialogTitle>
              <DialogDescription>Update the project name and description.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <label className="text-body">
                Name
                <input
                  className="focus-ring-accent mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-body"
                  onChange={(event) => setProjectName(event.target.value)}
                  value={projectName}
                />
              </label>
              <label className="text-body">
                Description
                <textarea
                  className="focus-ring-accent mt-1 min-h-[88px] w-full resize-y rounded-sm border border-border bg-background px-3 py-2 text-body"
                  onChange={(event) => setProjectDescription(event.target.value)}
                  rows={3}
                  value={projectDescription}
                />
              </label>
            </div>
            <DialogFooter className="gap-2 sm:justify-end">
              <Button onClick={() => setProjectDialogOpen(false)} type="button" variant="outline">
                Cancel
              </Button>
              <Button
                className="bg-brand text-brand-foreground hover:bg-brand-hover"
                disabled={isSavingProject}
                type="submit"
              >
                {isSavingProject ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        onOpenChange={(open) => {
          setTaskDialogOpen(open)
          if (!open) {
            resetTaskForm()
          }
        }}
        open={taskDialogOpen}
      >
        <DialogContent className="sm:max-w-md [&_input]:rounded-sm [&_select]:rounded-sm [&_textarea]:rounded-sm">
          <form className="grid gap-4" onSubmit={handleSaveTask}>
            <DialogHeader>
              <DialogTitle>{editingTaskId ? "Edit task" : "New task"}</DialogTitle>
              <DialogDescription>
                {editingTaskId ? "Update details for this task." : "Add a task to this project."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <label className="text-body">
                Title
                <input
                  className="focus-ring-accent mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-body"
                  onChange={(event) => setTitle(event.target.value)}
                  value={title}
                />
              </label>
              <label className="text-body">
                Description
                <textarea
                  className="focus-ring-accent mt-1 min-h-[80px] w-full resize-y rounded-sm border border-border bg-background px-3 py-2 text-body"
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  value={description}
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-body">
                  Status
                  <select
                    className="focus-ring-accent mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-body"
                    onChange={(event) => setTaskStatus(event.target.value as TaskStatus)}
                    value={taskStatus}
                  >
                    <option value="todo">Not started</option>
                    <option value="in_progress">In progress</option>
                    <option value="done">Completed</option>
                  </select>
                </label>
                <label className="text-body">
                  Priority
                  <select
                    className="focus-ring-accent mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-body"
                    onChange={(event) => setPriority(event.target.value as TaskPriority)}
                    value={priority}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Normal</option>
                    <option value="high">Urgent</option>
                  </select>
                </label>
              </div>
              <label className="text-body">
                Assignee
                <select
                  className="focus-ring-accent mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-body"
                  onChange={(event) => setAssigneeId(event.target.value)}
                  value={assigneeId}
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-body">
                Due date
                <input
                  className="focus-ring-accent mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-body"
                  onChange={(event) => setDueDate(event.target.value)}
                  type="date"
                  value={dueDate}
                />
              </label>
            </div>
            <DialogFooter className="gap-2 sm:justify-end">
              <Button
                onClick={() => {
                  setTaskDialogOpen(false)
                }}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                className="bg-brand text-brand-foreground hover:bg-brand-hover"
                disabled={isSaving}
                type="submit"
              >
                {isSaving ? "Saving…" : "Save task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="focus-ring-accent h-10 w-full rounded-full border border-toolbar-field-border bg-toolbar-field py-2 pl-10 pr-4 text-body text-foreground"
            onChange={(event) => setTaskSearch(event.target.value)}
            placeholder="Search tasks"
            type="search"
            value={taskSearch}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-caption text-muted-foreground">
            <span className="sr-only">Status filter</span>
            <select
              className="h-10 rounded-full border border-toolbar-field-border bg-toolbar-field px-3 py-2 text-body text-foreground"
              onChange={(event) => setStatusFilter(event.target.value as "" | TaskStatus)}
              value={statusFilter}
            >
              <option value="">All statuses</option>
              <option value="todo">Not started</option>
              <option value="in_progress">In progress</option>
              <option value="done">Completed</option>
            </select>
          </label>
          <label className="text-caption text-muted-foreground">
            <span className="sr-only">Assignee filter</span>
            <select
              className="h-10 rounded-full border border-toolbar-field-border bg-toolbar-field px-3 py-2 text-body text-foreground"
              onChange={(event) => setAssigneeFilter(event.target.value)}
              value={assigneeFilter}
            >
              <option value="">All assignees</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </label>
          <Button
            className="h-10 gap-2 rounded-full border border-toolbar-field-border bg-toolbar-field text-foreground hover:bg-toolbar-field/90"
            type="button"
            variant="ghost"
          >
            <Filter className="size-4" />
            Filter
          </Button>
        </div>
        <div className="flex items-center gap-1 rounded-sm border border-toolbar-field-border bg-toolbar-field p-1">
          <Button
            aria-pressed={viewMode === "board"}
            className="gap-1 rounded-sm"
            onClick={() => setViewMode("board")}
            size="sm"
            type="button"
            variant={viewMode === "board" ? "secondary" : "ghost"}
          >
            <LayoutGrid className="size-4" />
            Board
          </Button>
          <Button
            aria-pressed={viewMode === "list"}
            className="gap-1 rounded-sm"
            onClick={() => setViewMode("list")}
            size="sm"
            type="button"
            variant={viewMode === "list" ? "secondary" : "ghost"}
          >
            <List className="size-4" />
            List
          </Button>
        </div>
      </div>

      {errorMessage && <p className="text-caption text-destructive">{errorMessage}</p>}
      {isLoading && <p className="text-body text-muted-foreground">Loading project…</p>}

      {!isLoading && viewMode === "board" && (
        <div className="grid min-h-[320px] flex-1 gap-4 md:grid-cols-3">
          {TASK_STATUS_COLUMNS.map((column) => {
            const columnTasks = tasksForColumn(column.id)
            return (
              <section
                className={cn(
                  "flex min-h-[280px] flex-col rounded-sm border border-border/40 p-3",
                  column.surfaceClass
                )}
                key={column.id}
              >
                <div className="mb-3 flex items-center justify-between gap-2 px-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className={cn("size-2 shrink-0 rounded-full", column.dotClass)} />
                    <h2 className="truncate text-sm font-semibold">{column.label}</h2>
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-background/80 text-caption font-medium text-muted-foreground">
                      {columnTasks.length}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                      aria-label={`Add task to ${column.label}`}
                      className="size-8 rounded-sm"
                      onClick={() => {
                        resetTaskForm()
                        setTaskStatus(column.id)
                        setTaskDialogOpen(true)
                      }}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <Plus className="size-4" />
                    </Button>
                    <button
                      aria-label="Column menu"
                      className="rounded-sm p-1 text-muted-foreground hover:bg-background/60"
                      type="button"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-3">
                  {columnTasks.length === 0 && (
                    <p className="rounded-sm border border-dashed border-border/50 bg-background/30 px-3 py-8 text-center text-caption text-muted-foreground">
                      No tasks
                    </p>
                  )}
                  {columnTasks.map((task) => (
                    <div
                      className="rounded-sm border border-border/50 bg-card p-3.5 text-left transition-colors hover:border-border"
                      key={task.id}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-caption font-medium",
                            priorityChipClass(task.priority)
                          )}
                        >
                          {priorityLabel(task.priority)}
                        </span>
                        <button
                          aria-label="Task actions"
                          className="rounded-md p-1 text-muted-foreground hover:bg-muted/80"
                          onClick={() => openEditTaskDialog(task)}
                          type="button"
                        >
                          <MoreHorizontal className="size-4" />
                        </button>
                      </div>
                      <button
                        className="mt-2 w-full text-left"
                        onClick={() => openEditTaskDialog(task)}
                        type="button"
                      >
                        <p className="text-body font-semibold leading-snug">{task.title}</p>
                      </button>
                      {task.description ? (
                        <div className="mt-2 flex items-start gap-1.5 text-caption text-muted-foreground">
                          <AlignLeft className="mt-0.5 size-3.5 shrink-0" />
                          <p className="line-clamp-2">{task.description}</p>
                        </div>
                      ) : null}
                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/40 pt-3 text-caption text-muted-foreground">
                        <span
                          className="flex size-8 items-center justify-center rounded-full bg-brand/15 text-caption font-semibold text-brand-on-subtle"
                          title="Assignee"
                        >
                          {initialsForUser(users, task.assignee_id)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="size-3.5" />
                          {formatShortDate(task.due_date)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}

      {!isLoading && viewMode === "list" && (
        <div className="grid gap-2">
          {filteredTasks.length === 0 ? (
            <p className="rounded-sm border border-dashed bg-muted/20 px-4 py-10 text-center text-body text-muted-foreground">
              No tasks match these filters.
            </p>
          ) : (
            filteredTasks.map((task) => (
              <div
                className="flex flex-col gap-3 rounded-sm border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                key={task.id}
              >
                <div className="min-w-0">
                  <p className="text-body font-medium">{task.title}</p>
                  {task.description ? (
                    <p className="mt-1 text-caption text-muted-foreground">{task.description}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-caption font-medium",
                      priorityChipClass(task.priority)
                    )}
                  >
                    {priorityLabel(task.priority)}
                  </span>
                  <select
                    className="rounded-sm border border-border bg-background px-2 py-1 text-body"
                    onChange={(event) => void handleStatusChange(task.id, event.target.value as TaskStatus)}
                    value={task.status}
                  >
                    <option value="todo">Not started</option>
                    <option value="in_progress">In progress</option>
                    <option value="done">Completed</option>
                  </select>
                  <Button onClick={() => openEditTaskDialog(task)} type="button" variant="outline">
                    Edit
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {!isLoading && (
        <footer className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-page-panel-border-muted bg-toolbar-field/40 px-4 py-3 text-caption text-muted-foreground">
          <span>
            Not started: {tasksForColumn("todo").length} · In progress: {tasksForColumn("in_progress").length} ·
            Completed: {tasksForColumn("done").length}
          </span>
          <span>
            {stats.total} total · {stats.pct}% complete
          </span>
        </footer>
      )}
    </div>
  )
}
