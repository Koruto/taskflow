import { Button } from "@/components/ui/button"
import { TASK_STATUS_COLUMNS } from "@/lib/task-status-columns"
import {
  assigneeName,
  formatShortDate,
  priorityLabel,
  priorityPillClassName,
} from "@/lib/project-task-utils"
import { cn } from "@/lib/utils"
import type { AuthUser, Task, TaskStatus } from "@/types"
import { Plus } from "lucide-react"

type ProjectTaskListProps = {
  tasks: Task[]
  users: AuthUser[]
  onEditTask: (task: Task) => void
  onAddTask: (columnId: TaskStatus) => void
}

const LIST_ROW_GRID =
  "grid items-start grid-cols-[minmax(0,1.8fr)_minmax(0,3.8fr)_minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(0,2.2fr)]"

export function ProjectTaskList({ tasks, users, onEditTask, onAddTask }: ProjectTaskListProps) {
  return (
    <div className="flex flex-col gap-3">
      {TASK_STATUS_COLUMNS.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.id)
        return (
          <section
            className={cn(
              "flex flex-col overflow-hidden rounded-sm border border-border bg-background",
              column.surfaceClass
            )}
            key={column.id}
          >
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/50 py-2 pl-4 pr-2">
              <div className="flex min-w-0 items-center gap-1.5 pl-0.5">
                <span className={cn("size-1.5 shrink-0 rounded-full", column.dotClass)} />
                <h2 className={cn("truncate text-xs font-semibold uppercase tracking-wide", column.headerTextClass)}>
                  {column.label}
                </h2>
                <span
                  className={cn(
                    "inline-flex min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                    column.countBadgeClass
                  )}
                >
                  {columnTasks.length}
                </span>
              </div>
              <Button
                aria-label={`Add task to ${column.label}`}
                className="size-7 shrink-0 cursor-pointer rounded-sm"
                onClick={() => onAddTask(column.id)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <Plus className="size-3.5" />
              </Button>
            </div>

            <div className="flex min-w-0">
              <div aria-hidden className="w-3 shrink-0" />
              <div className="min-w-0 flex-1 overflow-x-auto rounded-tl-sm bg-background/90">
                {columnTasks.length === 0 ? (
                  <p className="px-3 py-12 text-center text-xs text-muted-foreground">No tasks in this column</p>
                ) : (
                  <div className="min-w-xl">
                    {/* Header */}
                    <div
                      className={cn(
                        LIST_ROW_GRID,
                        "border-b border-border/50 text-xs font-semibold uppercase tracking-wide",
                        column.headerTextClass
                      )}
                    >
                      <div className="px-3 py-2">Task</div>
                      <div className="px-3 py-2">Detail</div>
                      <div className="px-3 py-2">Priority</div>
                      <div className="px-3 py-2">Due</div>
                      <div className="px-3 py-2">Assignee</div>
                    </div>

                    {/* Rows */}
                    {columnTasks.map((task) => (
                      <div
                        className="cursor-pointer border-b border-border/40 transition-colors last:border-b-0 hover:bg-black/5 dark:hover:bg-white/7"
                        key={task.id}
                        onClick={() => onEditTask(task)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault()
                            onEditTask(task)
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <div className={cn(LIST_ROW_GRID, "text-sm")}>
                          <div className="min-w-0 px-3 py-2 text-foreground">{task.title}</div>
                          <div className="min-w-0 px-3 py-2 text-foreground/90">
                            {task.description?.trim() ? (
                              <span className="line-clamp-2">{task.description.trim()}</span>
                            ) : (
                              <span className="text-foreground/50">—</span>
                            )}
                          </div>
                          <div className="px-3 py-2">
                            <span
                              className={cn(
                                "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
                                priorityPillClassName(task.priority)
                              )}
                            >
                              {priorityLabel(task.priority)}
                            </span>
                          </div>
                          <div className="px-3 py-2 tabular-nums text-foreground/85">
                            {task.due_date ? (
                              formatShortDate(task.due_date)
                            ) : (
                              <span className="text-foreground/40">—</span>
                            )}
                          </div>
                          <div className="min-w-0 px-3 py-2 text-foreground/85">
                            <span className="line-clamp-2 wrap-break-word">
                              {assigneeName(users, task.assignee_id) ?? "Unassigned"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}
