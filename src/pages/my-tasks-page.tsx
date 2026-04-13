import { type FormEvent, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { ApiError } from "@/lib/api/client"
import { listTasksAssignedToUser, listUsers, updateTask } from "@/lib/api/taskflow"
import { TASK_STATUS_COLUMNS } from "@/lib/task-status-columns"
import type { AuthUser, TaskPriority, TaskStatus, TaskWithProjectMeta } from "@/types"
import { cn } from "@/lib/utils"
import {
  CalendarDays,
  LayoutGrid,
  List,
  MoreHorizontal,
  Search,
  AlignLeft,
} from "lucide-react"

function formatShortDate(iso: string | null): string {
  if (!iso) {
    return "—"
  }
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
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

export function MyTasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<TaskWithProjectMeta[]>([])
  const [users, setUsers] = useState<AuthUser[]>([])
  const [viewMode, setViewMode] = useState<"board" | "list">("board")
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskWithProjectMeta | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [taskStatus, setTaskStatus] = useState<TaskStatus>("todo")
  const [priority, setPriority] = useState<TaskPriority>("medium")
  const [assigneeId, setAssigneeId] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  async function load() {
    if (!user?.id) {
      return
    }
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const [mine, usersResponse] = await Promise.all([listTasksAssignedToUser(user.id), listUsers()])
      setTasks(mine.tasks)
      setUsers(usersResponse.users)
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Unable to load tasks.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [user?.id])

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) {
      return tasks
    }
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(q) ||
        (task.description?.toLowerCase().includes(q) ?? false) ||
        task.project_name.toLowerCase().includes(q)
    )
  }, [tasks, search])

  function tasksForColumn(column: TaskStatus): TaskWithProjectMeta[] {
    return filteredTasks.filter((task) => task.status === column)
  }

  function openEditTaskDialog(task: TaskWithProjectMeta) {
    setEditingTask(task)
    setTitle(task.title)
    setDescription(task.description ?? "")
    setTaskStatus(task.status)
    setPriority(task.priority)
    setAssigneeId(task.assignee_id ?? "")
    setDueDate(task.due_date ?? "")
    setTaskDialogOpen(true)
  }

  function resetTaskForm() {
    setEditingTask(null)
    setTitle("")
    setDescription("")
    setTaskStatus("todo")
    setPriority("medium")
    setAssigneeId("")
    setDueDate("")
  }

  async function handleSaveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editingTask) {
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
      const updated = await updateTask(editingTask.id, payload)
      setTasks((current) =>
        current.map((entry) =>
          entry.id === editingTask.id
            ? { ...updated, project_name: entry.project_name }
            : entry
        )
      )
      setTaskDialogOpen(false)
      resetTaskForm()
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Unable to save task.")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleStatusChange(taskId: string, status: TaskStatus) {
    const previous = tasks
    setTasks((current) => current.map((task) => (task.id === taskId ? { ...task, status } : task)))
    try {
      const updated = await updateTask(taskId, { status })
      setTasks((current) =>
        current.map((task) =>
          task.id === taskId ? { ...updated, project_name: task.project_name } : task
        )
      )
    } catch (error) {
      setTasks(previous)
      setErrorMessage(error instanceof ApiError ? error.message : "Unable to update task status.")
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 px-1 py-1">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">My tasks</h1>
          <p className="mt-1 text-body text-muted-foreground">Everything assigned to you across projects.</p>
        </div>
        <Button
          asChild
          className="gap-2 self-start rounded-sm bg-teal-700 text-white hover:bg-teal-800"
          type="button"
        >
          <Link to="/projects">Go to projects</Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="h-10 w-full rounded-full border border-border/60 bg-muted/40 py-2 pl-10 pr-4 text-body outline-none ring-ring/30 transition-shadow focus-visible:ring-2"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tasks or projects"
            type="search"
            value={search}
          />
        </div>
        <div className="flex items-center gap-1 rounded-sm border border-border/60 bg-muted/30 p-1">
          <Button
            aria-pressed={viewMode === "board"}
            className="gap-1 rounded-lg"
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
            className="gap-1 rounded-lg"
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

      <Dialog
        onOpenChange={(open) => {
          setTaskDialogOpen(open)
          if (!open) {
            resetTaskForm()
          }
        }}
        open={taskDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <form className="grid gap-4" onSubmit={handleSaveTask}>
            <DialogHeader>
              <DialogTitle>Edit task</DialogTitle>
              <DialogDescription>
                {editingTask ? (
                  <>
                    In <span className="font-medium text-foreground">{editingTask.project_name}</span>
                  </>
                ) : null}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <label className="text-body">
                Title
                <input
                  className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-body outline-none ring-ring/40 focus-visible:ring-2"
                  onChange={(event) => setTitle(event.target.value)}
                  value={title}
                />
              </label>
              <label className="text-body">
                Description
                <textarea
                  className="mt-1 min-h-[80px] w-full resize-y rounded-sm border border-border bg-background px-3 py-2 text-body outline-none ring-ring/40 focus-visible:ring-2"
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  value={description}
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-body">
                  Status
                  <select
                    className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-body"
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
                    className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-body"
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
                  className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-body"
                  onChange={(event) => setAssigneeId(event.target.value)}
                  value={assigneeId}
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-body">
                Due date
                <input
                  className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-body"
                  onChange={(event) => setDueDate(event.target.value)}
                  type="date"
                  value={dueDate}
                />
              </label>
            </div>
            <DialogFooter className="gap-2 sm:justify-end">
              <Button onClick={() => setTaskDialogOpen(false)} type="button" variant="outline">
                Cancel
              </Button>
              <Button className="bg-teal-700 hover:bg-teal-800" disabled={isSaving} type="submit">
                {isSaving ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {errorMessage && <p className="text-caption text-destructive">{errorMessage}</p>}
      {isLoading && <p className="text-body text-muted-foreground">Loading tasks…</p>}

      {!isLoading && viewMode === "board" && (
        <div className="grid min-h-[320px] flex-1 gap-4 md:grid-cols-3">
          {TASK_STATUS_COLUMNS.map((column) => {
            const columnTasks = tasksForColumn(column.id)
            return (
              <section
                className={cn(
                  "flex min-h-[280px] flex-col rounded-sm border border-border/40 p-3 shadow-sm",
                  column.surfaceClass
                )}
                key={column.id}
              >
                <div className="mb-3 flex items-center justify-between gap-2 px-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className={cn("size-2 shrink-0 rounded-full", column.dotClass)} />
                    <h2 className="truncate text-sm font-semibold">{column.label}</h2>
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-background/80 text-caption font-medium text-muted-foreground shadow-sm">
                      {columnTasks.length}
                    </span>
                  </div>
                  <button
                    aria-label="Column menu"
                    className="rounded-lg p-1 text-muted-foreground hover:bg-background/60"
                    type="button"
                  >
                    <MoreHorizontal className="size-4" />
                  </button>
                </div>
                <div className="flex flex-1 flex-col gap-3">
                  {columnTasks.length === 0 && (
                    <p className="rounded-sm border border-dashed border-border/50 bg-background/30 px-3 py-8 text-center text-caption text-muted-foreground">
                      No tasks
                    </p>
                  )}
                  {columnTasks.map((task) => (
                    <div
                      className="rounded-sm border border-border/50 bg-card p-3.5 shadow-sm transition-shadow hover:shadow-md"
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
                        <p className="text-body font-semibold leading-snug text-foreground">{task.title}</p>
                      </button>
                      <div className="mt-2 flex items-center gap-1.5 text-caption text-muted-foreground">
                        <AlignLeft className="size-3.5 shrink-0" />
                        <Link
                          className="truncate hover:text-teal-800 hover:underline"
                          onClick={(event) => event.stopPropagation()}
                          to={`/projects/${task.project_id}`}
                        >
                          {task.project_name}
                        </Link>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/40 pt-3">
                        <span
                          className="flex size-8 items-center justify-center rounded-full bg-teal-600/15 text-caption font-semibold text-teal-900"
                          title="Assignee"
                        >
                          {initialsForUser(users, task.assignee_id)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-caption text-muted-foreground">
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
            <p className="rounded-sm border border-dashed bg-muted/20 px-4 py-12 text-center text-body text-muted-foreground">
              {search.trim() ? "No tasks match your search." : "No tasks assigned to you yet."}
            </p>
          ) : (
            filteredTasks.map((task) => (
              <div
                className="flex flex-col gap-3 rounded-sm border border-border/60 bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                key={task.id}
              >
                <div className="min-w-0">
                  <p className="text-body font-medium">{task.title}</p>
                  <p className="mt-0.5 text-caption text-muted-foreground">
                    <Link className="hover:underline" to={`/projects/${task.project_id}`}>
                      {task.project_name}
                    </Link>
                  </p>
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
                    className="rounded-sm border border-border bg-background px-2 py-1.5 text-body"
                    onChange={(event) => void handleStatusChange(task.id, event.target.value as TaskStatus)}
                    value={task.status}
                  >
                    <option value="todo">Not started</option>
                    <option value="in_progress">In progress</option>
                    <option value="done">Completed</option>
                  </select>
                  <Button
                    className="rounded-sm"
                    onClick={() => openEditTaskDialog(task)}
                    type="button"
                    variant="outline"
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
