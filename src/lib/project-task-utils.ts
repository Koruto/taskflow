import type { AuthUser, TaskPriority } from "@/types"

export function formatShortDate(iso: string | null): string {
  if (!iso) {
    return "—"
  }
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
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

export function priorityLabel(priority: TaskPriority): string {
  switch (priority) {
    case "high":
      return "Urgent"
    case "medium":
      return "Normal"
    case "low":
      return "Low"
  }
}
