import type { DraggableAttributes } from "@dnd-kit/core"
import {
  assigneeName,
  formatShortDate,
  initialsForUser,
  priorityLabel,
  priorityPillClassName,
} from "@/lib/project-task-utils"
import { cn } from "@/lib/utils"
import type { AuthUser, Task } from "@/types"
import { Calendar } from "lucide-react"

export type TaskCardSurfaceProps = {
  task: Task
  users: AuthUser[]
  className?: string
  style?: React.CSSProperties
  /** When false, renders a static preview (e.g. drag overlay) without edit affordances. */
  interactive?: boolean
  onCardClick?: (event: React.MouseEvent) => void
  onKeyDown?: (event: React.KeyboardEvent) => void
  /** Merged with outer element for sortable / draggable. */
  listeners?: Record<string, unknown>
  attributes?: DraggableAttributes
  /** Ref for draggable root. */
  setNodeRef?: (node: HTMLElement | null) => void
  isDragging?: boolean
  isOverlay?: boolean
  /** Column is an active drop target — emphasize card edge. */
  dropZoneHighlight?: boolean
}

export function TaskCardSurface({
  task,
  users,
  className,
  style,
  interactive = true,
  onCardClick,
  onKeyDown,
  listeners,
  attributes,
  setNodeRef,
  isDragging,
  isOverlay,
  dropZoneHighlight,
}: TaskCardSurfaceProps) {
  const named = assigneeName(users, task.assignee_id)

  return (
    <div
      className={cn(
        "group w-full min-w-0 rounded-md border border-border/80 bg-card p-3 text-left shadow-sm transition-[box-shadow,background-color,border-color]",
        !isOverlay && "hover:border-brand/40 hover:shadow-md",
        interactive && "cursor-grab active:cursor-grabbing",
        isDragging && "relative z-20 opacity-40",
        isOverlay && "shadow-md",
        dropZoneHighlight && "border-primary/50 ring-2 ring-inset ring-primary/35",
        className
      )}
      ref={setNodeRef}
      style={style}
      {...(attributes ?? {})}
      {...(listeners ?? {})}
      onClick={interactive ? onCardClick : undefined}
      onKeyDown={interactive ? onKeyDown : undefined}
    >
      <div className="flex w-full min-w-0 items-start justify-between gap-2">
        <span
          className={cn(
            "inline-flex max-w-[min(100%,14rem)] shrink items-center rounded-full px-2 py-0.5 text-[11px] font-medium leading-none",
            priorityPillClassName(task.priority)
          )}
        >
          {priorityLabel(task.priority)}
        </span>
      </div>

      <div className="mt-2 w-full min-w-0">
        <span className="line-clamp-3 text-sm font-medium leading-snug text-foreground">{task.title}</span>
        {task.description ? (
          <p className="mt-1 line-clamp-2 break-words text-xs leading-relaxed text-muted-foreground">{task.description}</p>
        ) : null}
      </div>

      <div className="mt-3 flex w-full min-w-0 items-center justify-between gap-2 border-t border-border/55 pt-3">
        {task.due_date ? (
          <div className="flex min-w-0 items-center gap-1 text-[11px] leading-none text-muted-foreground">
            <Calendar className="size-3.5 shrink-0 opacity-80" aria-hidden />
            <span className="tabular-nums">{formatShortDate(task.due_date)}</span>
          </div>
        ) : (
          <span className="text-[11px] leading-none text-muted-foreground/45">No due date</span>
        )}
        <div className="flex min-w-0 max-w-[55%] items-center justify-end gap-1.5 text-[11px] leading-none text-muted-foreground">
          {named ? (
            <>
              <span className="truncate text-right">{named}</span>
              <span
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-foreground"
                title={named}
              >
                {initialsForUser(users, task.assignee_id)}
              </span>
            </>
          ) : (
            <span>Unassigned</span>
          )}
        </div>
      </div>
    </div>
  )
}
