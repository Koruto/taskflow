import { type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { AuthUser, TaskPriority, TaskStatus } from "@/types"

type TaskDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingTaskId: string | null
  title: string
  onTitleChange: (value: string) => void
  description: string
  onDescriptionChange: (value: string) => void
  taskStatus: TaskStatus
  onTaskStatusChange: (value: TaskStatus) => void
  priority: TaskPriority
  onPriorityChange: (value: TaskPriority) => void
  assigneeId: string
  onAssigneeIdChange: (value: string) => void
  dueDate: string
  onDueDateChange: (value: string) => void
  users: AuthUser[]
  isSaving: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function TaskDialog({
  open,
  onOpenChange,
  editingTaskId,
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  taskStatus,
  onTaskStatusChange,
  priority,
  onPriorityChange,
  assigneeId,
  onAssigneeIdChange,
  dueDate,
  onDueDateChange,
  users,
  isSaving,
  onSubmit,
}: TaskDialogProps) {
  return (
    <Dialog
      onOpenChange={onOpenChange}
      open={open}
    >
      <DialogContent className="sm:max-w-md [&_input]:rounded-sm [&_select]:rounded-sm [&_textarea]:rounded-sm">
        <form className="grid gap-4" onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{editingTaskId ? "Edit task" : "New task"}</DialogTitle>
            <DialogDescription>
              {editingTaskId ? "Update details for this task." : "Add a task to this project."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <label className="text-body">
              Title
              <input
                className="focus-ring-accent mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-body"
                onChange={(event) => onTitleChange(event.target.value)}
                value={title}
              />
            </label>
            <label className="text-body">
              Description
              <textarea
                className="focus-ring-accent mt-1 min-h-[80px] w-full resize-y rounded-sm border border-border bg-background px-3 py-2 text-body"
                onChange={(event) => onDescriptionChange(event.target.value)}
                rows={3}
                value={description}
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-body">
                Status
                <select
                  className="focus-ring-accent mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-body"
                  onChange={(event) => onTaskStatusChange(event.target.value as TaskStatus)}
                  value={taskStatus}
                >
                  <option value="todo">Not started</option>
                  <option value="in_progress">In progress</option>
                  <option value="in_review">In review</option>
                  <option value="done">Completed</option>
                </select>
              </label>
              <label className="text-body">
                Priority
                <select
                  className="focus-ring-accent mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-body"
                  onChange={(event) => onPriorityChange(event.target.value as TaskPriority)}
                  value={priority}
                >
                  <option value="low">Low</option>
                  <option value="medium">Normal</option>
                  <option value="high">Urgent</option>
                </select>
              </label>
            </div>
            <label className="text-body">
              Assignee
              <select
                className="focus-ring-accent mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-body"
                onChange={(event) => onAssigneeIdChange(event.target.value)}
                value={assigneeId}
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-body">
              Due date
              <input
                className="focus-ring-accent mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-body"
                onChange={(event) => onDueDateChange(event.target.value)}
                type="date"
                value={dueDate}
              />
            </label>
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              onClick={() => {
                onOpenChange(false)
              }}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button className="bg-brand text-brand-foreground hover:bg-brand-hover" disabled={isSaving} type="submit">
              {isSaving ? "Saving…" : "Save task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
