import type { TaskStatus } from "@/types"

/**
 * Kanban columns left → right: Todo, In progress, In review, Done.
 * `id` values match `TaskStatus` and API/mock data.
 */
export const TASK_STATUS_COLUMNS: {
  id: TaskStatus
  label: string
  /** Column surface: gradient darker at top, lighter at bottom */
  surfaceClass: string
  dotClass: string
  /** Header title + count: same hue as column, darker for contrast */
  headerTextClass: string
  /** Task count pill: light surface, number same hue as column (match header) */
  countBadgeClass: string
}[] = [
    {
      id: "todo",
      label: "Todo",
      surfaceClass:
        "bg-gradient-to-b from-slate-200/60 to-slate-50 dark:from-slate-800/70 dark:to-slate-950/30",
      dotClass: "bg-slate-400",
      headerTextClass: "text-slate-700 dark:text-slate-200",
      countBadgeClass:
        "border border-slate-400/25 bg-white/90 text-slate-700 dark:border-white/15 dark:bg-white/15 dark:text-slate-200",
    },
    {
      id: "in_progress",
      label: "In progress",
      surfaceClass:
        "bg-gradient-to-b from-amber-200/60 to-amber-50 dark:from-amber-950/70 dark:to-amber-950/30",
      dotClass: "bg-amber-400",
      headerTextClass: "text-amber-950 dark:text-amber-100",
      countBadgeClass:
        "border border-amber-500/20 bg-white/90 text-amber-950 dark:border-amber-400/25 dark:bg-amber-950/20 dark:text-amber-100",
    },
    {
      id: "in_review",
      label: "In review",
      surfaceClass:
        "bg-gradient-to-b from-violet-300/60 to-violet-50 dark:from-violet-950/70 dark:to-violet-950/30",
      dotClass: "bg-violet-500",
      headerTextClass: "text-violet-900 dark:text-violet-100",
      countBadgeClass:
        "border border-violet-500/20 bg-white/90 text-violet-900 dark:border-violet-400/25 dark:bg-violet-950/25 dark:text-violet-100",
    },
    {
      id: "done",
      label: "Done",
      surfaceClass:
        "bg-gradient-to-b from-emerald-200/60 to-emerald-50 dark:from-emerald-950/70 dark:to-emerald-950/30",
      dotClass: "bg-emerald-500",
      headerTextClass: "text-emerald-900 dark:text-emerald-100",
      countBadgeClass:
        "border border-emerald-500/20 bg-white/90 text-emerald-900 dark:border-emerald-400/25 dark:bg-emerald-950/20 dark:text-emerald-100",
    },
  ]
