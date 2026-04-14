import { useCallback, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { addDays } from "date-fns/addDays"
import { endOfWeek } from "date-fns/endOfWeek"
import { format } from "date-fns/format"
import { parseISO } from "date-fns/parseISO"

import { useAuth } from "@/contexts/auth-context"
import { ApiError } from "@/lib/api/client"
import { getProject, listProjects } from "@/lib/api/taskflow"
import { priorityLabel, priorityPillClassName, taskStatusLabel } from "@/lib/project-task-utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { Project, Task, TaskPriority, TaskStatus } from "@/types"
import { AlertCircle, FileText, Folder, FolderKanban, RefreshCcw, Search } from "lucide-react"

type TaskRow = Task & { project_name: string }

const TASKS_TABLE_GRID =
  "grid grid-cols-[minmax(0,2.2fr)_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1.1fr)] gap-0"

const PRIORITY_ORDER: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 }

function compareIso(a: string, b: string): number {
  if (a < b) {
    return -1
  }
  if (a > b) {
    return 1
  }
  return 0
}

const PROJECT_CHIP_STYLES = [
  "bg-sky-500/15 text-sky-800 dark:text-sky-200",
  "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200",
  "bg-violet-500/15 text-violet-800 dark:text-violet-200",
  "bg-amber-500/15 text-amber-900 dark:text-amber-200",
  "bg-rose-500/15 text-rose-800 dark:text-rose-200",
]

function projectChipClass(projectId: string): string {
  let h = 0
  for (let i = 0; i < projectId.length; i += 1) {
    h += projectId.charCodeAt(i)
  }
  return PROJECT_CHIP_STYLES[h % PROJECT_CHIP_STYLES.length]!
}

function formatDue(iso: string | null): string {
  if (!iso) return "—"
  return format(parseISO(iso), "MMM d, yyyy")
}

export function DashboardPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<TaskRow[]>([])
  const [tableQuery, setTableQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user?.id) return
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const { projects: list } = await listProjects()
      setProjects(list)
      const rows: TaskRow[] = []
      for (const p of list) {
        const full = await getProject(p.id)
        for (const t of full.tasks) {
          rows.push({ ...t, project_name: p.name })
        }
      }
      setTasks(rows)
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Unable to load dashboard.")
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    void load()
  }, [load])

  const today = format(new Date(), "yyyy-MM-dd")
  const weekEnd = format(addDays(new Date(), 7), "yyyy-MM-dd")
  const calendarWeekEnd = useMemo(
    () => format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"),
    []
  )

  const summary = useMemo(() => {
    let dueToday = 0
    let overdue = 0
    let upcomingWeek = 0
    for (const t of tasks) {
      const due = t.due_date
      if (!due) {
        continue
      }
      if (due === today) {
        dueToday += 1
      }
      if (t.status !== "done" && compareIso(due, today) < 0) {
        overdue += 1
      }
      if (compareIso(due, today) > 0 && compareIso(due, weekEnd) <= 0) {
        upcomingWeek += 1
      }
    }
    return { dueToday, overdue, upcomingWeek }
  }, [tasks, today, weekEnd])

  const counts = useMemo(() => {
    const totalTasks = tasks.length
    const byStatus = (s: TaskStatus) => tasks.filter((t) => t.status === s).length
    return {
      totalTasks,
      inReview: byStatus("in_review"),
      done: byStatus("done"),
    }
  }, [tasks])

  const firstName = user?.name?.trim().split(/\s+/)[0] ?? "there"

  const weekRows = useMemo(() => {
    return tasks
      .filter((t) => {
        if (t.status === "done") return false
        const due = t.due_date
        if (!due) return false
        return compareIso(due, today) >= 0 && compareIso(due, calendarWeekEnd) <= 0
      })
      .sort((a, b) => {
        const dateCmp = compareIso(a.due_date!, b.due_date!)
        if (dateCmp !== 0) return dateCmp
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      })
  }, [tasks, today, calendarWeekEnd])

  const filteredTable = useMemo(() => {
    const q = tableQuery.trim().toLowerCase()
    const base = weekRows
    if (!q) {
      return base
    }
    return base.filter((t) => {
      const statusLabel = taskStatusLabel(t.status).toLowerCase()
      const pri = priorityLabel(t.priority).toLowerCase()
      return (
        t.title.toLowerCase().includes(q) ||
        t.project_name.toLowerCase().includes(q) ||
        statusLabel.includes(q) ||
        pri.includes(q)
      )
    })
  }, [weekRows, tableQuery])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-1 py-1">
      <div className="shrink-0">
        <h1 className="text-base font-medium text-foreground">
          Welcome back, <span className="font-semibold">{firstName}</span>
        </h1>
      </div>

      {!isLoading && errorMessage && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-page-panel-border bg-page-panel/50 px-6 py-14 text-center">
          <AlertCircle className="size-8 text-destructive/60" />
          <div>
            <p className="text-sm font-medium text-foreground">Failed to load dashboard data</p>
            <p className="mt-1 text-caption text-muted-foreground">{errorMessage}</p>
          </div>
          <Button
            className="gap-2 rounded-sm"
            onClick={() => void load()}
            size="sm"
            type="button"
            variant="outline"
          >
            <RefreshCcw className="size-3.5" />
            Try again
          </Button>
        </div>
      )}

      {isLoading && (
        <>
          <div className="flex w-fit max-w-full shrink-0 flex-wrap items-baseline gap-x-6 rounded-sm border border-page-panel-border bg-page-panel px-3 py-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="grid shrink-0 grid-cols-2 gap-2 xl:grid-cols-4 xl:gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div className="rounded-sm border border-page-panel-border bg-page-panel p-3 xl:p-4" key={i}>
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-2 h-7 w-12" />
              </div>
            ))}
          </div>
          <div className="hidden min-h-0 flex-1 flex-col gap-0 rounded-sm border border-page-panel-border bg-page-panel p-4 md:flex">
            <div className="flex shrink-0 items-center justify-between border-b border-page-panel-border pb-3">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-8 w-64 rounded-sm" />
            </div>
            <div className="mt-3 flex flex-col gap-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton className="h-10 w-full" key={i} />
              ))}
            </div>
          </div>
        </>
      )}

      {!isLoading && !errorMessage && (
        <>
          <div className="flex w-fit max-w-full shrink-0 flex-wrap items-baseline gap-x-4 gap-y-1 rounded-sm border border-page-panel-border bg-page-panel px-3 py-2 text-sm text-muted-foreground">
            <span>
              <span className="font-semibold tabular-nums text-foreground">{summary.dueToday}</span> tasks due today
            </span>
            <span className="text-border">·</span>
            <span>
              <span className="font-semibold tabular-nums text-foreground">{summary.overdue}</span> overdue tasks
            </span>
            <span className="text-border">·</span>
            <span>
              <span className="font-semibold tabular-nums text-foreground">{summary.upcomingWeek}</span> upcoming
              deadlines (next 7 days)
            </span>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-2 xl:grid-cols-4 xl:gap-3">
            <div className="rounded-sm border border-page-panel-border bg-page-panel p-3 xl:p-4">
              <p className="text-xs font-medium text-muted-foreground xl:text-sm">Total projects</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-foreground xl:text-2xl">{projects.length}</p>
            </div>

            <div className="rounded-sm border border-page-panel-border bg-page-panel p-3 xl:p-4">
              <p className="text-xs font-medium text-muted-foreground xl:text-sm">Total tasks</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-foreground xl:text-2xl">{counts.totalTasks}</p>
            </div>

            <div className="rounded-sm border border-page-panel-border bg-page-panel p-3 xl:p-4">
              <p className="text-xs font-medium text-muted-foreground xl:text-sm">In review</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-foreground xl:text-2xl">{counts.inReview}</p>
            </div>

            <div className="rounded-sm border border-page-panel-border bg-page-panel p-3 xl:p-4">
              <p className="text-xs font-medium text-muted-foreground xl:text-sm">Done tasks</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-foreground xl:text-2xl">{counts.done}</p>
            </div>
          </div>

          {/* This week's tasks — desktop only */}
          <section className="hidden min-h-0 flex-1 flex-col gap-0 rounded-sm border border-page-panel-border bg-page-panel p-4 md:flex">
            <div className="flex shrink-0 flex-col gap-2 border-b border-page-panel-border pb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <h2 className="flex h-8 items-center text-sm font-semibold leading-none text-foreground">
                This week&apos;s tasks
              </h2>
              <div className="relative w-full sm:max-w-md">
                <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="focus-ring-accent h-8 w-full rounded-sm border border-toolbar-field-border bg-toolbar-field py-1 pl-8 pr-2 text-sm"
                  onChange={(event) => setTableQuery(event.target.value)}
                  placeholder="Search"
                  type="search"
                  value={tableQuery}
                />
              </div>
            </div>

            <div className="tf-scrollbar-minimal min-h-0 flex-1 overflow-auto">
              <div className="min-w-208 text-sm leading-snug">
                <div className="sticky top-0 z-20 bg-page-panel font-medium text-foreground/80 shadow-[0_1px_0_0_color-mix(in_oklch,var(--foreground)_10%,transparent),0_4px_8px_-2px_rgba(0,0,0,0.07)]">
                  <div className={cn(TASKS_TABLE_GRID, "px-3 py-2.5")}>
                    <div>Task name</div>
                    <div>Project</div>
                    <div>Task status</div>
                    <div>Priority</div>
                    <div>Due Date</div>
                  </div>
                </div>

                {filteredTable.length === 0 ? (
                  <div className="px-3 py-8 text-center text-muted-foreground">
                    No tasks due this week{tableQuery.trim() ? " match your search." : "."}
                  </div>
                ) : (
                  filteredTable.map((task) => (
                    <div
                      className="group relative border-b border-border/60 transition-colors hover:bg-muted/55"
                      key={task.id}
                    >
                      <Link
                        aria-label={`Open project ${task.project_name}`}
                        className="absolute inset-0 block"
                        to={`/projects/${task.project_id}`}
                      />
                      <div className={cn(TASKS_TABLE_GRID, "pointer-events-none relative px-3 py-2.5 text-foreground")}>
                        <div className="flex min-w-0 items-center gap-2">
                          <FileText className="size-4 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 font-medium text-brand underline-offset-2 group-hover:underline">
                            {task.title}
                          </span>
                        </div>
                        <div className="text-muted-foreground">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-sm font-medium text-foreground",
                              projectChipClass(task.project_id)
                            )}
                          >
                            <Folder className="size-3.5 shrink-0" />
                            {task.project_name}
                          </span>
                        </div>
                        <div className="text-muted-foreground">{taskStatusLabel(task.status)}</div>
                        <div>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-caption font-medium leading-none",
                              priorityPillClassName(task.priority)
                            )}
                          >
                            {priorityLabel(task.priority)}
                          </span>
                        </div>
                        <div className="text-muted-foreground">{formatDue(task.due_date)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-2 md:hidden">
            <h2 className="text-sm font-semibold">Your projects</h2>
            {projects.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-sm border border-dashed border-page-panel-border bg-page-panel px-4 py-10 text-center">
                <FolderKanban className="size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No projects yet.</p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {projects.map((project) => (
                  <li key={project.id}>
                    <Link
                      className={cn(
                        "flex min-h-16 overflow-hidden rounded-sm border border-page-panel-border bg-page-panel shadow-sm",
                        "transition-[border-color] hover:border-brand/40"
                      )}
                      to={`/projects/${project.id}`}
                    >
                      <div
                        aria-hidden
                        className="project-accent-strip w-[3px] shrink-0"
                      />
                      <div className="min-w-0 flex-1 px-3 py-2.5">
                        <p className="text-sm font-semibold leading-snug text-foreground">
                          {project.name.trim() || "Untitled project"}
                        </p>
                        {project.description?.trim() ? (
                          <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground">
                            {project.description.trim()}
                          </p>
                        ) : (
                          <p className="mt-0.5 text-xs text-muted-foreground/70">No description</p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}
