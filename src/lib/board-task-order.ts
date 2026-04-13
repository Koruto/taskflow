import { arrayMove } from "@dnd-kit/sortable"
import { TASK_STATUS_COLUMNS } from "@/lib/task-status-columns"
import type { Task, TaskStatus } from "@/types"

export const BOARD_COLUMN_IDS = TASK_STATUS_COLUMNS.map((c) => c.id)

const EMPTY_PREFIX = "board-empty-"

export function boardEmptyDropId(status: TaskStatus): string {
  return `${EMPTY_PREFIX}${status}`
}

export function isBoardEmptyDropId(id: string): boolean {
  return id.startsWith(EMPTY_PREFIX)
}

export function findBoardContainer(
  needle: string,
  columnTaskIds: Record<TaskStatus, string[]>
): TaskStatus | undefined {
  if ((BOARD_COLUMN_IDS as readonly string[]).includes(needle)) {
    return needle as TaskStatus
  }
  for (const status of BOARD_COLUMN_IDS) {
    if (needle === boardEmptyDropId(status)) {
      return status
    }
  }
  for (const status of BOARD_COLUMN_IDS) {
    if (columnTaskIds[status].includes(needle)) {
      return status
    }
  }
  return undefined
}

const STATUS_ORDER: TaskStatus[] = ["todo", "in_progress", "in_review", "done"]

export function emptyColumnTaskIds(): Record<TaskStatus, string[]> {
  return { todo: [], in_progress: [], in_review: [], done: [] }
}

/** Column task id order: follows global `tasks` order within each status, restricted to filtered ids. */
export function deriveColumnTaskIds(allTasks: Task[], filtered: Task[]): Record<TaskStatus, string[]> {
  const filteredSet = new Set(filtered.map((t) => t.id))
  const cols = emptyColumnTaskIds()
  for (const t of allTasks) {
    if (filteredSet.has(t.id)) {
      cols[t.status].push(t.id)
    }
  }
  return cols
}

/**
 * Apply a drop using only @dnd-kit's active/over ids (call from onDragEnd — not onDragOver).
 * Returns null if nothing changes.
 */
export function applyDropToColumnTaskIds(
  columnTaskIds: Record<TaskStatus, string[]>,
  activeId: string,
  overId: string
): Record<TaskStatus, string[]> | null {
  const activeColumn = findBoardContainer(activeId, columnTaskIds)
  const overColumn = findBoardContainer(overId, columnTaskIds)
  if (!activeColumn || !overColumn) {
    return null
  }

  if (activeColumn === overColumn) {
    if ((BOARD_COLUMN_IDS as readonly string[]).includes(overId)) {
      return null
    }
    if (isBoardEmptyDropId(overId)) {
      return null
    }
    const oldIndex = columnTaskIds[activeColumn].indexOf(activeId)
    const newIndex = columnTaskIds[activeColumn].indexOf(overId)
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
      return null
    }
    return {
      ...columnTaskIds,
      [activeColumn]: arrayMove(columnTaskIds[activeColumn], oldIndex, newIndex),
    }
  }

  const movingId = activeId
  const sourceIds = columnTaskIds[activeColumn].filter((id) => id !== movingId)

  let destIds: string[]
  let insertIndex: number

  if (isBoardEmptyDropId(overId)) {
    destIds = []
    insertIndex = 0
  } else if ((BOARD_COLUMN_IDS as readonly string[]).includes(overId)) {
    destIds = [...columnTaskIds[overId as TaskStatus]]
    insertIndex = destIds.length
  } else {
    destIds = [...columnTaskIds[overColumn]]
    const overIndex = destIds.indexOf(overId)
    insertIndex = overIndex >= 0 ? overIndex : destIds.length
  }

  const destWithout = destIds.filter((id) => id !== movingId)
  const nextDest = [...destWithout.slice(0, insertIndex), movingId, ...destWithout.slice(insertIndex)]

  return {
    ...columnTaskIds,
    [activeColumn]: sourceIds,
    [overColumn]: nextDest,
  }
}

export function reorderTasksFromColumnIds(
  tasks: Task[],
  columnTaskIds: Record<TaskStatus, string[]>
): Task[] {
  const byId = new Map(tasks.map((t) => [t.id, t]))
  const listed = new Set<string>()
  const result: Task[] = []
  for (const status of STATUS_ORDER) {
    for (const id of columnTaskIds[status]) {
      const t = byId.get(id)
      if (t) {
        listed.add(id)
        result.push(t.status === status ? t : { ...t, status })
      }
    }
  }
  for (const t of tasks) {
    if (!listed.has(t.id)) {
      result.push(t)
    }
  }
  return result
}
