import type { TaskStatus } from "@/types"

export const TASK_STATUS_COLUMNS: {
  id: TaskStatus
  label: string
  /** Pastel column surface */
  surfaceClass: string
  dotClass: string
}[] = [
  { id: "todo", label: "Not started", surfaceClass: "bg-slate-100/80", dotClass: "bg-slate-400" },
  { id: "in_progress", label: "In progress", surfaceClass: "bg-amber-50/90", dotClass: "bg-amber-400" },
  { id: "in_review", label: "In review", surfaceClass: "bg-violet-50/90 dark:bg-violet-950/35", dotClass: "bg-violet-500" },
  { id: "done", label: "Completed", surfaceClass: "bg-emerald-50/90", dotClass: "bg-emerald-500" },
]
