import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import { Button } from "@/components/ui/button"
import { SortableTaskCard } from "@/components/project-detail/sortable-task-card"
import { boardEmptyDropId } from "@/lib/board-task-order"
import { useColumnDropTarget } from "@/components/project-detail/use-column-drop-highlight"
import { cn } from "@/lib/utils"
import type { AuthUser, Task, TaskStatus } from "@/types"
import type { MutableRefObject } from "react"
import { Plus } from "lucide-react"

type BoardColumnProps = {
  columnId: TaskStatus
  columnLabel: string
  columnTasksCount: number
  columnDotClass: string
  columnSurfaceClass: string
  columnTaskIds: Record<TaskStatus, string[]>
  taskIds: string[]
  taskById: Map<string, Task>
  users: AuthUser[]
  onAddTask: () => void
  onEditTask: (task: Task) => void
  skipClickForTaskIdRef: MutableRefObject<string | null>
  isDragActive: boolean
}

function BoardEmptyDropZone({
  columnId,
  isDragActive,
  columnDropTarget,
}: {
  columnId: TaskStatus
  isDragActive: boolean
  columnDropTarget: boolean
}) {
  const id = boardEmptyDropId(columnId)
  const { setNodeRef, isOver } = useDroppable({ id })
  const showActiveDrop = isDragActive && (isOver || columnDropTarget)

  return (
    <div
      className={cn(
        "flex min-h-[120px] flex-1 flex-col items-center justify-center rounded-sm border border-solid px-2 py-6 text-center transition-[box-shadow,background-color,border-color]",
        showActiveDrop
          ? "border-primary/55 bg-primary/10 shadow-[inset_0_0_0_2px_hsl(var(--primary)/0.35)]"
          : "border-border/40 bg-background/30"
      )}
      ref={setNodeRef}
    >
      <p className="text-xs text-muted-foreground">Empty</p>
    </div>
  )
}

export function BoardColumn({
  columnId,
  columnLabel,
  columnTasksCount,
  columnDotClass,
  columnSurfaceClass,
  columnTaskIds,
  taskIds,
  taskById,
  users,
  onAddTask,
  onEditTask,
  skipClickForTaskIdRef,
  isDragActive,
}: BoardColumnProps) {
  const columnDropTarget = useColumnDropTarget(columnId, columnTaskIds)

  return (
    <div
      className={cn(
        "flex h-full min-h-0 min-w-0 flex-1 flex-col rounded-sm border border-border/35 p-2 transition-colors",
        columnSurfaceClass
      )}
    >
      <div className="mb-2 flex shrink-0 items-center justify-between gap-2 px-0.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className={cn("size-1.5 shrink-0 rounded-full", columnDotClass)} />
          <h2 className="truncate text-xs font-semibold uppercase tracking-wide text-muted-foreground">{columnLabel}</h2>
          <span className="tabular-nums text-[11px] text-muted-foreground">({columnTasksCount})</span>
        </div>
        <Button
          aria-label={`Add task to ${columnLabel}`}
          className="size-7 shrink-0 cursor-pointer rounded-sm"
          onClick={onAddTask}
          onPointerDown={(event) => event.stopPropagation()}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Plus className="size-3.5" />
        </Button>
      </div>

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden rounded-sm transition-[box-shadow,background-color]",
          isDragActive && columnDropTarget && "bg-primary/8 shadow-[inset_0_0_0_2px_hsl(var(--primary)/0.45)]"
        )}
      >
        {taskIds.length === 0 ? (
          <BoardEmptyDropZone
            columnDropTarget={columnDropTarget}
            columnId={columnId}
            isDragActive={isDragActive}
          />
        ) : (
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            <div className="flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto overflow-x-hidden pr-0.5 *:mb-2 *:last:mb-0">
              {taskIds.map((id) => {
                const task = taskById.get(id)
                if (!task) {
                  return null
                }
                return (
                  <SortableTaskCard
                    columnDropTarget={columnDropTarget}
                    key={id}
                    onEdit={onEditTask}
                    skipClickForTaskIdRef={skipClickForTaskIdRef}
                    task={task}
                    users={users}
                  />
                )
              })}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  )
}
