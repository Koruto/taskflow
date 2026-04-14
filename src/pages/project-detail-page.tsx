import { type FormEvent, useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { useMediaQuery } from "@/hooks/use-media-query"
import { ProjectTaskBoard } from "@/components/project-detail/project-task-board"
import { ProjectTaskList } from "@/components/project-detail/project-task-list"
import { TaskDialog } from "@/components/project-detail/task-dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiError } from "@/lib/api/client"
import { TASK_STATUS_COLUMNS } from "@/lib/task-status-columns"
import {
  createTask,
  getProject,
  listUsers,
  updateTask,
} from "@/lib/api/taskflow"
import type { AuthUser, Project, Task, TaskPriority, TaskStatus } from "@/types"
import { AlertCircle, FolderX, LayoutGrid, List, Plus, RefreshCcw } from "lucide-react"

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<AuthUser[]>([])
  const [statusFilter, setStatusFilter] = useState<"" | TaskStatus>("")
  const [assigneeFilter, setAssigneeFilter] = useState("")
  const [viewMode, setViewMode] = useState<"board" | "list">("board")
  const isMdUp = useMediaQuery("(min-width: 768px)")
  const effectiveViewMode: "board" | "list" = isMdUp ? viewMode : "board"
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [taskStatus, setTaskStatus] = useState<TaskStatus>("todo")
  const [priority, setPriority] = useState<TaskPriority>("medium")
  const [assigneeId, setAssigneeId] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [taskValidationError, setTaskValidationError] = useState<string | null>(null)
  const saveAbortRef = useRef<AbortController | null>(null)
  const [pendingTaskIds, setPendingTaskIds] = useState<Set<string>>(new Set())

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (statusFilter && task.status !== statusFilter) {
        return false
      }
      if (assigneeFilter && task.assignee_id !== assigneeFilter) {
        return false
      }
      return true
    })
  }, [tasks, statusFilter, assigneeFilter])

  const stats = useMemo(() => {
    const total = filteredTasks.length
    const done = filteredTasks.filter((task) => task.status === "done").length
    const pct = total === 0 ? 0 : Math.round((done / total) * 100)
    return { total, done, pct }
  }, [filteredTasks])

  const loadingRef = useRef(false)

  async function loadProjectAndTasks() {
    if (!projectId) {
      return
    }
    setIsLoading(true)
    setErrorMessage(null)
    setNotFound(false)
    loadingRef.current = true
    try {
      const [projectResponse, usersResponse] = await Promise.all([getProject(projectId), listUsers()])
      if (!loadingRef.current) {
        return
      }
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
      if (!loadingRef.current) {
        return
      }
      if (error instanceof ApiError && error.status === 404) {
        setNotFound(true)
      } else {
        setErrorMessage(error instanceof ApiError ? error.message : "Unable to load project.")
      }
    } finally {
      if (loadingRef.current) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    void loadProjectAndTasks()
    return () => {
      loadingRef.current = false
    }
  }, [projectId])

  useEffect(() => {
    const state = location.state as { openProjectEdit?: boolean } | null
    if (!state?.openProjectEdit || !project) {
      return
    }
    navigate(location.pathname, { replace: true, state: {} })
  }, [location.pathname, location.state, navigate, project])

  function resetTaskForm() {
    setEditingTaskId(null)
    setTitle("")
    setDescription("")
    setTaskStatus("todo")
    setPriority("medium")
    setAssigneeId("")
    setDueDate("")
    setTaskValidationError(null)
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

  async function handleSaveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!projectId) return
    if (!title.trim()) {
      setTaskValidationError("Title is required.")
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

    const controller = new AbortController()
    saveAbortRef.current = controller
    setIsSaving(true)
    setTaskValidationError(null)
    try {
      if (editingTaskId) {
        const updated = await updateTask(editingTaskId, payload, controller.signal)
        if (controller.signal.aborted) return
        setTasks((current) => current.map((entry) => (entry.id === editingTaskId ? updated : entry)))
      } else {
        const created = await createTask(projectId, payload, controller.signal)
        if (controller.signal.aborted) return
        setTasks((current) => [created, ...current])
      }
      setTaskDialogOpen(false)
      resetTaskForm()
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return
      toast.error(editingTaskId ? "Failed to update task" : "Failed to create task", {
        description: error instanceof ApiError ? error.message : "Something went wrong. Please try again.",
      })
    } finally {
      if (!controller.signal.aborted) {
        setIsSaving(false)
      }
    }
  }

  function handleBoardCommit(nextTasks: Task[]) {
    const prevSnapshot = [...tasks]
    setTasks(nextTasks)
    for (const t of nextTasks) {
      const p = prevSnapshot.find((x) => x.id === t.id)
      if (p && p.status !== t.status) {
        const taskId = t.id
        setPendingTaskIds((prev) => new Set(Array.from(prev).concat(taskId)))
        void (async () => {
          try {
            const updated = await updateTask(taskId, { status: t.status })
            setTasks((cur) => cur.map((x) => (x.id === taskId ? updated : x)))
          } catch (error) {
            setTasks(prevSnapshot)
            toast.error("Failed to update task status", {
              description: error instanceof ApiError ? error.message : "Something went wrong. Please try again.",
            })
          } finally {
            setPendingTaskIds((prev) => {
              const next = new Set(prev)
              next.delete(taskId)
              return next
            })
          }
        })()
      }
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

  if (notFound) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
        <FolderX className="size-12 text-muted-foreground/60" />
        <div>
          <p className="text-base font-semibold text-foreground">Project not found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This project may have been deleted or you may not have access.
          </p>
        </div>
        <Button
          className="gap-2 rounded-sm"
          onClick={() => navigate("/projects")}
          type="button"
          variant="outline"
        >
          Back to projects
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-3 overflow-x-hidden px-1 py-1">
      <div className="flex flex-col gap-3 pb-1 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {isLoading ? (
            <>
              <Skeleton className="h-5 w-48" />
              <Skeleton className="mt-1.5 h-3.5 w-72" />
            </>
          ) : (
            <>
              <button
                className="block w-full max-w-full text-left text-base font-medium leading-none text-foreground underline-offset-2"
                type="button"
              >
                {project?.name ?? "Project"}
              </button>
              <p className="mt-0.5 max-w-2xl text-sm leading-snug text-muted-foreground">
                {project?.description != null && project.description.trim() !== ""
                  ? project.description.trim()
                  : "No description yet."}
              </p>
            </>
          )}
        </div>
        <Button
          className="gap-2 self-start rounded-sm bg-brand text-brand-foreground hover:bg-brand-hover"
          disabled={isLoading || errorMessage !== null}
          onClick={openCreateTaskDialog}
          type="button"
        >
          <Plus className="size-4" />
          Create new task
        </Button>
      </div>

      <TaskDialog
        assigneeId={assigneeId}
        description={description}
        dueDate={dueDate}
        editingTaskId={editingTaskId}
        error={taskValidationError}
        isSaving={isSaving}
        onAssigneeIdChange={setAssigneeId}
        onDescriptionChange={setDescription}
        onDueDateChange={setDueDate}
        onOpenChange={(open) => {
          if (!open) {
            saveAbortRef.current?.abort()
            saveAbortRef.current = null
            setIsSaving(false)
            resetTaskForm()
          }
          setTaskDialogOpen(open)
        }}
        onPriorityChange={setPriority}
        onSubmit={handleSaveTask}
        onTaskStatusChange={setTaskStatus}
        onTitleChange={setTitle}
        open={taskDialogOpen}
        priority={priority}
        taskStatus={taskStatus}
        title={title}
        users={users}
      />

      <div className="flex flex-row flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-row flex-wrap items-center gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <div className="flex shrink-0 rounded-sm border border-toolbar-field-border bg-toolbar-field p-1">
              <Select
                onValueChange={(value) => {
                  setStatusFilter(value === "all" ? "" : (value as TaskStatus))
                }}
                value={statusFilter || "all"}
              >
                <SelectTrigger
                  aria-label="Filter by status"
                  className="min-w-34 max-w-56"
                  variant="segmented"
                >
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {TASK_STATUS_COLUMNS.map((column) => (
                    <SelectItem key={column.id} value={column.id}>
                      {column.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex shrink-0 rounded-sm border border-toolbar-field-border bg-toolbar-field p-1">
              <Select
                onValueChange={(value) => {
                  setAssigneeFilter(value === "all" ? "" : value)
                }}
                value={assigneeFilter || "all"}
              >
                <SelectTrigger
                  aria-label="Filter by assignee"
                  className="min-w-34 max-w-56"
                  variant="segmented"
                >
                  <SelectValue placeholder="All assignees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All assignees</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="hidden shrink-0 gap-1 rounded-sm border border-toolbar-field-border bg-toolbar-field p-1 md:flex">
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

      {isLoading && (
        <div className="grid auto-rows-[minmax(14rem,1fr)] grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              className="flex flex-col gap-2 rounded-sm border border-border p-2"
              key={i}
            >
              <div className="mb-1 flex items-center gap-2 px-0.5">
                <Skeleton className="size-1.5 rounded-full" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="ml-auto h-4 w-4 rounded-full" />
              </div>
              <div className="flex flex-col gap-2">
                {Array.from({ length: i === 0 ? 3 : i === 1 ? 2 : 1 }).map((__, j) => (
                  <div
                    className="rounded-md border border-border/60 bg-card p-3"
                    key={j}
                  >
                    <Skeleton className="h-3 w-16 rounded-full" />
                    <Skeleton className="mt-2 h-3.5 w-full" />
                    <Skeleton className="mt-1 h-3 w-3/4" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && errorMessage === null && effectiveViewMode === "board" && (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto">
          <ProjectTaskBoard
            filteredTasks={filteredTasks}
            onAddTask={(columnId) => {
              resetTaskForm()
              setTaskStatus(columnId)
              setTaskDialogOpen(true)
            }}
            onBoardCommit={handleBoardCommit}
            onEditTask={openEditTaskDialog}
            pendingTaskIds={pendingTaskIds}
            tasks={tasks}
            users={users}
          />
        </div>
      )}

      {!isLoading && errorMessage === null && effectiveViewMode === "list" && (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="tf-scrollbar-minimal min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1">
            <ProjectTaskList
              onAddTask={(columnId) => {
                resetTaskForm()
                setTaskStatus(columnId)
                setTaskDialogOpen(true)
              }}
              onEditTask={openEditTaskDialog}
              tasks={filteredTasks}
              users={users}
            />
          </div>
        </div>
      )}

      {!isLoading && errorMessage !== null && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-page-panel-border bg-page-panel/50 px-6 py-14 text-center">
          <AlertCircle className="size-8 text-destructive/60" />
          <div>
            <p className="text-sm font-medium text-foreground">Failed to load project</p>
            <p className="mt-1 text-caption text-muted-foreground">{errorMessage}</p>
          </div>
          <Button
            className="gap-2 rounded-sm"
            onClick={() => void loadProjectAndTasks()}
            size="sm"
            type="button"
            variant="outline"
          >
            <RefreshCcw className="size-3.5" />
            Try again
          </Button>
        </div>
      )}

      {!isLoading && errorMessage === null && (
        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 rounded-sm border border-page-panel-border-muted bg-toolbar-field/40 px-4 py-3 text-caption text-muted-foreground">
          <span>
            Todo: {tasksForColumn("todo").length} · In progress: {tasksForColumn("in_progress").length} · In review:{" "}
            {tasksForColumn("in_review").length} · Done: {tasksForColumn("done").length}
          </span>
          <span>
            {stats.total} total · {stats.pct}% complete
          </span>
        </footer>
      )}
    </div>
  )
}
