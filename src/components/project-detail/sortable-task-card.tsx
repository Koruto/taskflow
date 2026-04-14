import { type MutableRefObject, useRef } from "react"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { TaskCardSurface } from "@/components/project-detail/task-card-surface"
import type { AuthUser, Task } from "@/types"

type SortableTaskCardProps = {
  task: Task
  users: AuthUser[]
  isPending?: boolean
  onEdit: (task: Task) => void
  skipClickForTaskIdRef: MutableRefObject<string | null>
}

export function SortableTaskCard({
  task,
  users,
  isPending,
  onEdit,
  skipClickForTaskIdRef,
}: SortableTaskCardProps) {
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const mergedListeners = {
    ...listeners,
    onPointerDown: (event: React.PointerEvent) => {
      if (event.button === 0) {
        pointerDownPos.current = { x: event.clientX, y: event.clientY }
      }
      listeners?.onPointerDown?.(event)
    },
  }

  function handleCardClick(event: React.MouseEvent) {
    if (skipClickForTaskIdRef.current === task.id) {
      skipClickForTaskIdRef.current = null
      return
    }
    const down = pointerDownPos.current
    pointerDownPos.current = null
    if (down) {
      const moved = Math.hypot(event.clientX - down.x, event.clientY - down.y)
      if (moved > 8) {
        return
      }
    }
    onEdit(task)
  }

  return (
    <div className="min-w-0 w-full" ref={setNodeRef} style={style} {...attributes}>
      <TaskCardSurface
        className={isDragging ? "cursor-grabbing" : undefined}
        isDragging={isDragging}
        isPending={isPending}
        listeners={mergedListeners}
        onCardClick={handleCardClick}
        onKeyDown={(event) => {
          listeners?.onKeyDown?.(event)
          if (event.defaultPrevented) {
            return
          }
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            onEdit(task)
          }
        }}
        task={task}
        users={users}
      />
    </div>
  )
}
