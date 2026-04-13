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

export function ProjectTaskList({ tasks, users, onEditTask, onAddTask }: ProjectTaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-sm border border-page-panel-border bg-page-panel px-4 py-10 text-center">
        <p className="text-sm text-muted-foreground">No tasks match these filters.</p>
      </div>
    )
  }

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
                    "inline-flex min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
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
                  <table className="w-full min-w-xl table-fixed border-collapse">
                    <thead>
                      <tr className="border-b border-border/50 bg-transparent">
                        <th
                          className={cn(
                            "px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide w-[18%]",
                            column.headerTextClass
                          )}
                        >
                          Task
                        </th>
                        <th
                          className={cn(
                            "px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide w-[38%]",
                            column.headerTextClass
                          )}
                        >
                          Detail
                        </th>
                        <th
                          className={cn(
                            "px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide w-[11%]",
                            column.headerTextClass
                          )}
                        >
                          Priority
                        </th>
                        <th
                          className={cn(
                            "px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide w-[11%]",
                            column.headerTextClass
                          )}
                        >
                          Due
                        </th>
                        <th
                          className={cn(
                            "px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide w-[22%]",
                            column.headerTextClass
                          )}
                        >
                          Assignee
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {columnTasks.map((task) => (
                        <tr
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
                          <td className="min-w-0 px-3 py-2 align-top text-sm">
                            <span className="font-medium text-foreground">{task.title}</span>
                          </td>
                          <td className="min-w-0 px-3 py-2 align-top text-sm text-foreground/90">
                            {task.description?.trim() ? (
                              <span className="line-clamp-2">{task.description.trim()}</span>
                            ) : (
                              <span className="text-foreground/50">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2 align-top text-sm">
                            <span
                              className={cn(
                                "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
                                priorityPillClassName(task.priority)
                              )}
                            >
                              {priorityLabel(task.priority)}
                            </span>
                          </td>
                          <td className="px-3 py-2 align-top text-sm tabular-nums text-foreground/85">
                            {task.due_date ? (
                              formatShortDate(task.due_date)
                            ) : (
                              <span className="text-foreground/40">—</span>
                            )}
                          </td>
                          <td className="min-w-0 px-3 py-2 align-top text-sm text-foreground/85">
                            <span className="line-clamp-2 wrap-break-word">{assigneeName(users, task.assignee_id) ?? "Unassigned"}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}
