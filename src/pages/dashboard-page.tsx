import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { ApiError } from "@/lib/api/client"
import { getProject, listProjects } from "@/lib/api/taskflow"
import { cn } from "@/lib/utils"
import type { Project, Task, TaskStatus } from "@/types"
import { FileText, Filter, Folder, Search } from "lucide-react"

type TaskRow = Task & { project_name: string }

function todayIsoLocal(): string {
  const n = new Date()
  const y = n.getFullYear()
  const m = String(n.getMonth() + 1).padStart(2, "0")
  const d = String(n.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function addDaysIso(iso: string, days: number): string {
  const [ys, ms, ds] = iso.split("-").map(Number)
  const dt = new Date(ys!, ms! - 1, ds!)
  dt.setDate(dt.getDate() + days)
  const y = dt.getFullYear()
  const m = String(dt.getMonth() + 1).padStart(2, "0")
  const d = String(dt.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

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
  if (!iso) {
    return "—"
  }
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

function MetricSpark({ variant }: { variant: "up" | "down" | "flat" }) {
  const pts =
    variant === "up"
      ? "0,24 8,18 16,20 24,8 32,12 40,4 48,0"
      : variant === "down"
        ? "0,4 8,12 16,10 24,20 32,16 40,24 48,22"
        : "0,14 8,12 16,14 24,13 32,14 40,13 48,14"
  const strokeClass =
    variant === "up" ? "text-chart-positive" : variant === "down" ? "text-chart-negative" : "text-chart-neutral"
  return (
    <svg aria-hidden className={cn("h-8 w-20 shrink-0", strokeClass)} viewBox="0 0 48 24">
      <polyline
        fill="none"
        points={pts}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<TaskRow[]>([])
  const [tableQuery, setTableQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const userId = user?.id
    if (!userId) {
      return
    }
    let cancelled = false
    async function load() {
      setIsLoading(true)
      setErrorMessage(null)
      try {
        const { projects: list } = await listProjects()
        if (cancelled) {
          return
        }
        setProjects(list)
        const rows: TaskRow[] = []
        for (const p of list) {
          const full = await getProject(p.id)
          if (cancelled) {
            return
          }
          for (const t of full.tasks) {
            rows.push({ ...t, project_name: p.name })
          }
        }
        setTasks(rows)
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof ApiError ? error.message : "Unable to load dashboard.")
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  const today = todayIsoLocal()
  const weekEnd = addDaysIso(today, 7)

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
      todo: byStatus("todo"),
      inProgress: byStatus("in_progress"),
      done: byStatus("done"),
    }
  }, [tasks])

  const completionPct = counts.totalTasks === 0 ? 0 : Math.round((counts.done / counts.totalTasks) * 100)

  const firstName = user?.name?.trim().split(/\s+/)[0] ?? "there"

  const todaysRows = useMemo(() => {
    return tasks.filter((t) => t.due_date === today)
  }, [tasks, today])

  const filteredTable = useMemo(() => {
    const q = tableQuery.trim().toLowerCase()
    const base = todaysRows
    if (!q) {
      return base
    }
    return base.filter(
      (t) => t.title.toLowerCase().includes(q) || t.project_name.toLowerCase().includes(q)
    )
  }, [todaysRows, tableQuery])

  const weekBars = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0]
    for (const t of tasks) {
      if (!t.due_date) {
        continue
      }
      const d = new Date(`${t.due_date}T12:00:00`)
      const js = d.getDay()
      const idx = js === 0 ? 6 : js - 1
      counts[idx] += 1
    }
    return counts
  }, [tasks])

  return (
    <div className="flex flex-col gap-3 px-1 py-1">
      <div>
        <h1 className="text-base font-medium text-foreground">
          Welcome back, <span className="font-semibold">{firstName}</span>
        </h1>
      </div>

      {errorMessage && <p className="text-caption text-destructive">{errorMessage}</p>}
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

      {!isLoading && (
        <>
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-sm border border-page-panel-border bg-page-panel px-3 py-2 text-sm text-muted-foreground">
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

          <div className="grid gap-3 md:grid-cols-3">
            <div className="flex flex-col justify-between rounded-sm border border-page-panel-border bg-page-panel p-4">
              <div>
                <p className="text-caption font-medium text-muted-foreground">Total projects</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{projects.length}</p>
                <p className="mt-0.5 text-caption text-emerald-600 dark:text-emerald-400">+5 vs last month</p>
              </div>
              <div className="mt-3 flex items-end justify-between gap-2">
                <MetricSpark variant="up" />
                <Button asChild className="h-7 rounded-sm px-2 text-xs" size="sm" variant="outline">
                  <Link to="/projects">View</Link>
                </Button>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-sm border border-page-panel-border bg-page-panel p-4">
              <div>
                <p className="text-caption font-medium text-muted-foreground">Total tasks</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{counts.totalTasks}</p>
                <p className="mt-0.5 text-caption text-red-600 dark:text-red-400">-1 vs last month</p>
              </div>
              <div className="mt-3 flex items-end justify-between gap-2">
                <MetricSpark variant="down" />
                <Button asChild className="h-7 rounded-sm px-2 text-xs" size="sm" variant="outline">
                  <Link to="/dashboard">View</Link>
                </Button>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-sm border border-page-panel-border bg-page-panel p-4">
              <div>
                <p className="text-caption font-medium text-muted-foreground">In progress</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{counts.inProgress}</p>
                <p className="mt-0.5 text-caption text-emerald-600 dark:text-emerald-400">+12 vs last month</p>
              </div>
              <div className="mt-3 flex items-end justify-between gap-2">
                <MetricSpark variant="up" />
                <Button asChild className="h-7 rounded-sm px-2 text-xs" size="sm" variant="outline">
                  <Link to="/projects">Open</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <section className="rounded-sm border border-page-panel-border bg-page-panel p-4 lg:col-span-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-sm font-semibold">Today&apos;s tasks</h2>
                <div className="flex flex-1 flex-wrap items-center gap-2 sm:max-w-md sm:justify-end">
                  <div className="relative min-w-40 flex-1">
                    <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      className="focus-ring-accent h-8 w-full rounded-sm border border-toolbar-field-border bg-toolbar-field py-1 pl-8 pr-2 text-sm"
                      onChange={(event) => setTableQuery(event.target.value)}
                      placeholder="Search"
                      type="search"
                      value={tableQuery}
                    />
                  </div>
                  <Button
                    className="h-8 rounded-sm border border-toolbar-field-border bg-toolbar-field px-2 text-xs text-foreground hover:bg-toolbar-field/90"
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    <Filter className="size-3.5" />
                    Filter
                  </Button>
                </div>
              </div>

              <div className="mt-3 overflow-x-auto rounded-sm border border-page-panel-border-muted">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead className="border-b border-page-panel-border-muted bg-toolbar-field/50 text-caption text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-medium">Task name</th>
                      <th className="px-3 py-2 font-medium">Project</th>
                      <th className="px-3 py-2 font-medium">Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTable.length === 0 ? (
                      <tr>
                        <td className="px-3 py-8 text-center text-muted-foreground" colSpan={3}>
                          No tasks due today{tableQuery.trim() ? " match your search." : "."}
                        </td>
                      </tr>
                    ) : (
                      filteredTable.map((task) => (
                        <tr className="border-b border-page-panel-border-subtle last:border-0" key={task.id}>
                          <td className="px-3 py-2">
                            <span className="inline-flex items-center gap-2 font-medium text-foreground">
                              <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                              <Link className="hover:underline" to={`/projects/${task.project_id}`}>
                                {task.title}
                              </Link>
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-caption font-medium",
                                projectChipClass(task.project_id)
                              )}
                            >
                              <Folder className="size-3 shrink-0" />
                              {task.project_name}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">{formatDue(task.due_date)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="flex flex-col rounded-sm border border-page-panel-border bg-page-panel p-4">
              <h2 className="text-sm font-semibold">Performance</h2>
              <p className="mt-0.5 text-caption text-muted-foreground">Completion across all projects</p>
              <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight">{completionPct}%</p>
              <p className="mt-0.5 text-caption text-emerald-600 dark:text-emerald-400">+15 vs last month</p>
              <div className="mt-4 flex flex-1 flex-col justify-end">
                <p className="mb-1.5 text-caption text-muted-foreground">This week</p>
                <div className="flex h-28 items-end justify-between gap-1">
                  {weekBars.map((h, i) => {
                    const max = Math.max(...weekBars, 1)
                    const pct = max === 0 ? 0 : (h / max) * 100
                    return (
                      <div className="flex flex-1 flex-col items-center gap-1" key={i}>
                        <div
                          className={cn(
                            "w-full max-w-8 rounded-t-sm bg-linear-to-t from-brand-chart-deep/90 to-brand-chart-mid/80",
                            i === 2 && "ring-1 ring-brand-emphasis/55"
                          )}
                          style={{ height: `${24 + pct * 0.72}%`, minHeight: "20px" }}
                          title={`${h} tasks`}
                        />
                        <span className="text-caption text-muted-foreground">
                          {["M", "T", "W", "T", "F", "S", "S"][i]}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  )
}
