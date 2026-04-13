import { useMemo, useRef, useState } from "react"

import { BoardColumn } from "@/components/project-detail/board-column"
import { TaskCardSurface } from "@/components/project-detail/task-card-surface"
import {
  applyDropToColumnTaskIds,
  deriveColumnTaskIds,
  reorderTasksFromColumnIds,
} from "@/lib/board-task-order"
import { TASK_STATUS_COLUMNS } from "@/lib/task-status-columns"
import type { AuthUser, Task, TaskStatus } from "@/types"
import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"

type ProjectTaskBoardProps = {
  tasks: Task[]
  filteredTasks: Task[]
  users: AuthUser[]
  onAddTask: (columnId: TaskStatus) => void
  onEditTask: (task: Task) => void
  onBoardCommit: (nextTasks: Task[]) => void
}

export function ProjectTaskBoard({
  tasks,
  filteredTasks,
  users,
  onAddTask,
  onEditTask,
  onBoardCommit,
}: ProjectTaskBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const skipClickForTaskIdRef = useRef<string | null>(null)

  const columnTaskIds = useMemo(() => deriveColumnTaskIds(tasks, filteredTasks), [tasks, filteredTasks])

  const taskById = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  )

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id)
    const task = tasks.find((t) => t.id === id) ?? null
    setActiveTask(task)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    skipClickForTaskIdRef.current = String(active.id)
    setActiveTask(null)

    if (!over) {
      return
    }

    const overId = String(over.id)
    const nextIds = applyDropToColumnTaskIds(columnTaskIds, String(active.id), overId)
    if (!nextIds) {
      return
    }

    const nextTasks = reorderTasksFromColumnIds(tasks, nextIds)
    onBoardCommit(nextTasks)
  }

  function handleDragCancel() {
    setActiveTask(null)
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
        <div className="grid h-full min-h-0 w-full min-w-0 flex-1 auto-rows-[minmax(14rem,1fr)] grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {TASK_STATUS_COLUMNS.map((column) => {
            const ids = columnTaskIds[column.id]
            return (
              <div className="flex min-h-0 min-w-0 flex-1 flex-col" key={column.id}>
                <BoardColumn
                  columnCountBadgeClass={column.countBadgeClass}
                  columnDotClass={column.dotClass}
                  columnHeaderTextClass={column.headerTextClass}
                  columnId={column.id}
                  columnLabel={column.label}
                  columnSurfaceClass={column.surfaceClass}
                  columnTaskIds={columnTaskIds}
                  columnTasksCount={ids.length}
                  isDragActive={Boolean(activeTask)}
                  onAddTask={() => onAddTask(column.id)}
                  onEditTask={onEditTask}
                  skipClickForTaskIdRef={skipClickForTaskIdRef}
                  taskById={taskById}
                  taskIds={ids}
                  users={users}
                />
              </div>
            )
          })}
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div className="w-[min(100%,22rem)] min-w-[min(100%,22rem)] max-w-[calc(100vw-2rem)] cursor-grabbing">
            <TaskCardSurface interactive={false} isOverlay task={activeTask} users={users} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
