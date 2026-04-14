import { useDndContext } from "@dnd-kit/core"
import { useMemo } from "react"

import { findBoardContainer } from "@/lib/board-task-order"
import type { TaskStatus } from "@/types"

export function useColumnDropTarget(columnId: TaskStatus, columnTaskIds: Record<TaskStatus, string[]>): boolean {
  const { active, over } = useDndContext()

  return useMemo(() => {
    if (!active || !over) {
      return false
    }
    return findBoardContainer(String(over.id), columnTaskIds) === columnId
  }, [active, over, columnId, columnTaskIds])
}
