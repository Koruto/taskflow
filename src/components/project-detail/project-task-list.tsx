import { Button } from "@/components/ui/button"
import { formatShortDate, priorityLabel } from "@/lib/project-task-utils"
import type { Task, TaskStatus } from "@/types"

type ProjectTaskListProps = {
  tasks: Task[]
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onEditTask: (task: Task) => void
}

export function ProjectTaskList({ tasks, onStatusChange, onEditTask }: ProjectTaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-sm border border-border/40">
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">No tasks match these filters.</p>
      </div>
    )
  }

  return (
    <div className="rounded-sm border border-border/40">
      <ul className="divide-y divide-border/45">
        {tasks.map((task) => (
          <li
            className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            key={task.id}
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-snug">{task.title}</p>
              {task.description ? (
                <p className="mt-0.5 line-clamp-2 break-words text-xs text-muted-foreground">{task.description}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:shrink-0 sm:justify-end">
              <span className="text-[11px] tabular-nums text-muted-foreground">{formatShortDate(task.due_date)}</span>
              <span className="text-[11px] text-muted-foreground">{priorityLabel(task.priority)}</span>
              <select
                className="h-7 max-w-38 rounded-sm border border-border/60 bg-background px-1.5 text-xs"
                onChange={(event) => onStatusChange(task.id, event.target.value as TaskStatus)}
                value={task.status}
              >
                <option value="todo">Todo</option>
                <option value="in_progress">In progress</option>
                <option value="in_review">In review</option>
                <option value="done">Done</option>
              </select>
              <Button className="h-7 px-2 text-xs" onClick={() => onEditTask(task)} size="sm" type="button" variant="outline">
                Edit
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
