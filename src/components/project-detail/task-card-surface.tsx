import type { DraggableAttributes } from "@dnd-kit/core"
import { formatShortDate, initialsForUser, priorityLabel } from "@/lib/project-task-utils"
import { cn } from "@/lib/utils"
import type { AuthUser, Task } from "@/types"
import { GripVertical, Pencil } from "lucide-react"

export type TaskCardSurfaceProps = {
  task: Task
  users: AuthUser[]
  className?: string
  style?: React.CSSProperties
  /** When false, renders a static preview (e.g. drag overlay) without edit affordances. */
  interactive?: boolean
  onEdit?: (task: Task) => void
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
  onEdit,
  onCardClick,
  onKeyDown,
  listeners,
  attributes,
  setNodeRef,
  isDragging,
  isOverlay,
  dropZoneHighlight,
}: TaskCardSurfaceProps) {
  return (
    <div
      className={cn(
        "group w-full min-w-0 rounded-sm border border-border/30 bg-card/90 p-2 text-left transition-[box-shadow,background-color,border-color]",
        !isOverlay && "hover:border-border/55 hover:bg-card",
        interactive && "cursor-pointer",
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
      <div className="flex items-start gap-1">
        <span
          aria-hidden
          className="mt-0.5 shrink-0 cursor-inherit rounded p-0.5 text-muted-foreground group-hover:text-foreground"
        >
          <GripVertical className="size-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <span className="line-clamp-3 text-sm font-medium leading-snug text-foreground">{task.title}</span>
          {task.description ? (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{task.description}</p>
          ) : null}
        </div>
        {interactive && onEdit ? (
          <button
            aria-label="Edit task"
            className="-mr-0.5 -mt-0.5 shrink-0 cursor-pointer rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted/70 hover:text-foreground group-hover:opacity-100"
            onClick={(event) => {
              event.stopPropagation()
              onEdit(task)
            }}
            onPointerDown={(event) => event.stopPropagation()}
            type="button"
          >
            <Pencil className="size-3.5" />
          </button>
        ) : null}
      </div>
      <p className="mt-2 truncate pl-6 text-[11px] leading-none text-muted-foreground">
        <span>{priorityLabel(task.priority)}</span>
        <span className="mx-1 text-border/70">·</span>
        <span className="tabular-nums">{formatShortDate(task.due_date)}</span>
        <span className="mx-1 text-border/70">·</span>
        <span>{initialsForUser(users, task.assignee_id)}</span>
      </p>
    </div>
  )
}
