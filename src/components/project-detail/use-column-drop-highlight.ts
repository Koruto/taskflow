import { useDndContext } from "@dnd-kit/core"
import { useMemo } from "react"

import { findBoardContainer } from "@/lib/board-task-order"
import type { TaskStatus } from "@/types"

/** True while dragging and the pointer's `over` target belongs to this column (tasks, empty zone, or column id). */
export function useColumnDropTarget(columnId: TaskStatus, columnTaskIds: Record<TaskStatus, string[]>): boolean {
  const { active, over } = useDndContext()

  return useMemo(() => {
    if (!active || !over) {
      return false
    }
    return findBoardContainer(String(over.id), columnTaskIds) === columnId
  }, [active, over, columnId, columnTaskIds])
}
