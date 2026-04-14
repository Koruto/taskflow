import { type FormEvent, useState } from "react"
import { format } from "date-fns/format"
import { parseISO } from "date-fns/parseISO"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { DialogInput, DialogLabel, DialogSpanLabel, DialogTextarea } from "@/components/ui/dialog-field"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TASK_STATUS_COLUMNS } from "@/lib/task-status-columns"
import { priorityLabel, priorityPillClassName } from "@/lib/project-task-utils"
import { cn } from "@/lib/utils"
import type { AuthUser, TaskPriority, TaskStatus } from "@/types"
import { CalendarDays } from "lucide-react"

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
  error?: string | null
}

const PRIORITIES: TaskPriority[] = ["low", "medium", "high"]

const RequiredMark = () => <span aria-hidden className="ml-0.5 text-destructive">*</span>

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
  error,
}: TaskDialogProps) {
  const [duePopoverOpen, setDuePopoverOpen] = useState(false)

  const selectedDue = dueDate ? parseISO(`${dueDate}T12:00:00`) : undefined

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="gap-0 p-0 sm:max-w-lg [&_button]:text-caption">
        <form className="grid" onSubmit={onSubmit}>
          <DialogHeader className="border-b border-border/60 px-4 py-3 pr-12">
            <DialogTitle className="font-heading text-base font-medium leading-none">
              {editingTaskId ? "Edit task" : "Create task"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-3 px-4 py-3">
            <div className="grid gap-1">
              <DialogLabel htmlFor="task-title">
                Title<RequiredMark />
              </DialogLabel>
              <DialogInput
                id="task-title"
                onChange={(event) => onTitleChange(event.target.value)}
                value={title}
              />
              {error && (
                <p className="text-caption text-destructive">{error}</p>
              )}
            </div>

            <div className="grid gap-1">
              <DialogLabel htmlFor="task-desc">Description</DialogLabel>
              <DialogTextarea
                id="task-desc"
                onChange={(event) => onDescriptionChange(event.target.value)}
                value={description}
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2 sm:gap-2">
              <div className="grid min-w-0 gap-1">
                <DialogSpanLabel>
                  Status<RequiredMark />
                </DialogSpanLabel>
                <Select onValueChange={(v) => onTaskStatusChange(v as TaskStatus)} value={taskStatus}>
                  <SelectTrigger
                    className="h-9 w-full min-w-0! border-border bg-background"
                    variant="field"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_STATUS_COLUMNS.map((column) => (
                      <SelectItem key={column.id} value={column.id}>
                        {column.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid min-w-0 gap-1">
                <DialogSpanLabel>
                  Assignee<RequiredMark />
                </DialogSpanLabel>
                <Select
                  onValueChange={(v) => onAssigneeIdChange(v === "none" ? "" : v)}
                  value={assigneeId || "none"}
                >
                  <SelectTrigger
                    className="h-9 w-full min-w-0! border-border bg-background"
                    variant="field"
                  >
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid min-w-0 gap-1">
              <DialogSpanLabel>
                Priority<RequiredMark />
              </DialogSpanLabel>
              <div className="flex min-h-9 gap-1 rounded-sm border border-toolbar-field-border bg-toolbar-field p-1">
                {PRIORITIES.map((p) => (
                  <button
                    className={cn(
                      "min-w-0 flex-1 cursor-pointer rounded-[min(var(--radius-md),12px)] px-1.5 py-1 text-center text-caption font-medium transition-colors",
                      priority === p
                        ? cn(priorityPillClassName(p), "shadow-sm")
                        : "border border-transparent bg-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )}
                    key={p}
                    onClick={() => onPriorityChange(p)}
                    type="button"
                  >
                    {priorityLabel(p)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-1">
              <DialogSpanLabel>Due date</DialogSpanLabel>
              <Popover onOpenChange={setDuePopoverOpen} open={duePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    className={cn(
                      "h-9 w-full justify-start gap-2 border-border bg-background px-2.5 font-normal text-caption hover:bg-muted/60"
                    )}
                    type="button"
                    variant="outline"
                  >
                    <CalendarDays className="size-4 shrink-0 opacity-70" />
                    {dueDate && selectedDue ? format(selectedDue, "MMM d, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    onSelect={(date) => {
                      onDueDateChange(date ? format(date, "yyyy-MM-dd") : "")
                      setDuePopoverOpen(false)
                    }}
                    selected={selectedDue}
                  />
                </PopoverContent>
              </Popover>
            </div>

          </div>

          <DialogFooter className="mx-0 mb-0 gap-2 rounded-none border-border/60 bg-muted/30 px-4 py-3 sm:justify-end">
            <Button
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button className="bg-brand text-brand-foreground hover:bg-brand-hover" disabled={isSaving} type="submit">
              {isSaving ? "Saving…" : editingTaskId ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
