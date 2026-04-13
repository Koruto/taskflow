import { type MutableRefObject, useRef } from "react"

import { useDndContext } from "@dnd-kit/core"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { TaskCardSurface } from "@/components/project-detail/task-card-surface"
import type { AuthUser, Task } from "@/types"

type SortableTaskCardProps = {
  task: Task
  users: AuthUser[]
  onEdit: (task: Task) => void
  skipClickForTaskIdRef: MutableRefObject<string | null>
  columnDropTarget: boolean
}

export function SortableTaskCard({
  task,
  users,
  onEdit,
  skipClickForTaskIdRef,
  columnDropTarget,
}: SortableTaskCardProps) {
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null)
  const { active } = useDndContext()

  const { attributes, active: sortableActive, listeners, over, setNodeRef, transform, transition, isDragging } =
    useSortable({
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

  const isThisDragged = sortableActive?.id === task.id
  const insertBeforeIndicator = Boolean(
    sortableActive && sortableActive.id !== task.id && over && over.id === task.id
  )

  const rect = active?.rect.current
  const dragItemHeight = Math.max(
    40,
    Math.round(rect?.translated?.height ?? rect?.initial?.height ?? 72)
  )

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
      {insertBeforeIndicator ? (
        <div aria-hidden className="shrink-0" style={{ height: dragItemHeight }} />
      ) : null}
      <TaskCardSurface
        className={isThisDragged ? "cursor-grabbing" : undefined}
        dropZoneHighlight={columnDropTarget && !isThisDragged}
        isDragging={isDragging}
        listeners={mergedListeners}
        onCardClick={handleCardClick}
        onEdit={onEdit}
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
        style={undefined}
        task={task}
        users={users}
      />
    </div>
  )
}
