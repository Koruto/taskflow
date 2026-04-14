import { format } from "date-fns/format"
import { parseISO } from "date-fns/parseISO"

import { TASK_STATUS_COLUMNS } from "@/lib/task-status-columns"
import type { AuthUser, TaskPriority, TaskStatus } from "@/types"

export function formatShortDate(iso: string | null): string {
  if (!iso) return "—"
  return format(parseISO(iso), "MMM d")
}

export function initialsForUser(users: AuthUser[], userId: string | null): string {
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

export function taskStatusLabel(status: TaskStatus): string {
  return TASK_STATUS_COLUMNS.find((c) => c.id === status)?.label ?? status
}

/** Chip styles aligned with board column count badges. */
export function taskStatusChipClassName(status: TaskStatus): string {
  return (
    TASK_STATUS_COLUMNS.find((c) => c.id === status)?.countBadgeClass ??
    "border border-border bg-muted text-foreground"
  )
}

export function priorityLabel(priority: TaskPriority): string {
  switch (priority) {
    case "low":
      return "Low"
    case "medium":
      return "Medium"
    case "high":
      return "High"
    default: {
      const _exhaustive: never = priority
      return _exhaustive
    }
  }
}

/** Tailwind classes for priority pills on task cards (light + dark). */
export function priorityPillClassName(priority: TaskPriority): string {
  switch (priority) {
    case "low":
      return "border border-slate-300/80 bg-slate-100 text-slate-800 dark:border-slate-600/80 dark:bg-slate-800/90 dark:text-slate-100"
    case "medium":
      return "border border-sky-400/55 bg-sky-100 text-sky-950 dark:border-sky-600/60 dark:bg-sky-950/55 dark:text-sky-50"
    case "high":
      return "border border-rose-400/60 bg-rose-100 text-rose-950 dark:border-rose-700/70 dark:bg-rose-950/55 dark:text-rose-50"
    default: {
      const _exhaustive: never = priority
      return _exhaustive
    }
  }
}

export function assigneeName(users: AuthUser[], assigneeId: string | null): string | null {
  if (!assigneeId) {
    return null
  }
  const user = users.find((entry) => entry.id === assigneeId)
  return user?.name ?? null
}
