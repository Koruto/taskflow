import { cn } from "@/lib/utils"

/** Narrow strip per project; softer gradients, distinct hues (no strong yellow). */
const ACCENT_STRIP_CLASSES = [
  "bg-gradient-to-b from-sky-500/55 to-sky-400/15 dark:from-sky-500/45 dark:to-sky-600/25",
  "bg-gradient-to-b from-cyan-600/50 to-cyan-500/15 dark:from-cyan-500/45 dark:to-cyan-700/20",
  "bg-gradient-to-b from-violet-500/55 to-violet-400/15 dark:from-violet-500/45 dark:to-violet-600/25",
  "bg-gradient-to-b from-emerald-500/55 to-emerald-400/15 dark:from-emerald-500/45 dark:to-emerald-600/25",
  "bg-gradient-to-b from-indigo-500/55 to-indigo-400/15 dark:from-indigo-500/45 dark:to-indigo-600/25",
]

export function projectAccentStripClass(projectId: string): string {
  let h = 0
  for (let i = 0; i < projectId.length; i += 1) {
    h += projectId.charCodeAt(i)
  }
  return cn(ACCENT_STRIP_CLASSES[h % ACCENT_STRIP_CLASSES.length])
}
