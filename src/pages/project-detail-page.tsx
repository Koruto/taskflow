import { type FormEvent, useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"

import { ProjectEditDialog } from "@/components/project-detail/project-edit-dialog"
import { ProjectTaskBoard } from "@/components/project-detail/project-task-board"
import { ProjectTaskList } from "@/components/project-detail/project-task-list"
import { TaskDialog } from "@/components/project-detail/task-dialog"
import { Button } from "@/components/ui/button"
import { ApiError } from "@/lib/api/client"
import {
  createTask,
  getProject,
  listUsers,
  updateProject,
  updateTask,
} from "@/lib/api/taskflow"
import type { AuthUser, Project, Task, TaskPriority, TaskStatus } from "@/types"
import { Filter, LayoutGrid, List, Pencil, Plus, Search } from "lucide-react"

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

  function handleBoardCommit(nextTasks: Task[]) {
    const prevSnapshot = tasks
    setTasks(nextTasks)
    for (const t of nextTasks) {
      const p = prevSnapshot.find((x) => x.id === t.id)
      if (p && p.status !== t.status) {
        void (async () => {
          try {
            const updated = await updateTask(t.id, { status: t.status })
            setTasks((cur) => cur.map((x) => (x.id === t.id ? updated : x)))
          } catch (error) {
            setTasks(prevSnapshot)
            setErrorMessage(error instanceof ApiError ? error.message : "Unable to update task status.")
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

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-4 overflow-x-hidden px-1 py-1">
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

      <ProjectEditDialog
        isSaving={isSavingProject}
        onOpenChange={setProjectDialogOpen}
        onProjectDescriptionChange={setProjectDescription}
        onProjectNameChange={setProjectName}
        onSubmit={handleSaveProject}
        open={projectDialogOpen}
        projectDescription={projectDescription}
        projectName={projectName}
      />

      <TaskDialog
        assigneeId={assigneeId}
        description={description}
        dueDate={dueDate}
        editingTaskId={editingTaskId}
        isSaving={isSaving}
        onAssigneeIdChange={setAssigneeId}
        onDescriptionChange={setDescription}
        onDueDateChange={setDueDate}
        onOpenChange={(open) => {
          setTaskDialogOpen(open)
          if (!open) {
            resetTaskForm()
          }
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
              <option value="in_review">In review</option>
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
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <ProjectTaskBoard
            filteredTasks={filteredTasks}
            onAddTask={(columnId) => {
              resetTaskForm()
              setTaskStatus(columnId)
              setTaskDialogOpen(true)
            }}
            onBoardCommit={handleBoardCommit}
            onEditTask={openEditTaskDialog}
            tasks={tasks}
            users={users}
          />
        </div>
      )}

      {!isLoading && viewMode === "list" && (
        <ProjectTaskList
          onEditTask={openEditTaskDialog}
          onStatusChange={(taskId, status) => void handleStatusChange(taskId, status)}
          tasks={filteredTasks}
        />
      )}

      {!isLoading && (
        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 rounded-sm border border-page-panel-border-muted bg-toolbar-field/40 px-4 py-3 text-caption text-muted-foreground">
          <span>
            Not started: {tasksForColumn("todo").length} · In progress: {tasksForColumn("in_progress").length} · In
            review: {tasksForColumn("in_review").length} · Completed: {tasksForColumn("done").length}
          </span>
          <span>
            {stats.total} total · {stats.pct}% complete
          </span>
        </footer>
      )}
    </div>
  )
}
