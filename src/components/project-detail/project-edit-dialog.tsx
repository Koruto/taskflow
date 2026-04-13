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

type ProjectEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectName: string
  onProjectNameChange: (value: string) => void
  projectDescription: string
  onProjectDescriptionChange: (value: string) => void
  isSaving: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function ProjectEditDialog({
  open,
  onOpenChange,
  projectName,
  onProjectNameChange,
  projectDescription,
  onProjectDescriptionChange,
  isSaving,
  onSubmit,
}: ProjectEditDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md [&_input]:rounded-sm [&_select]:rounded-sm [&_textarea]:rounded-sm">
        <form className="grid gap-4" onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Edit project</DialogTitle>
            <DialogDescription>Update the project name and description.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <label className="text-body">
              Name
              <input
                className="focus-ring-accent mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-body"
                onChange={(event) => onProjectNameChange(event.target.value)}
                value={projectName}
              />
            </label>
            <label className="text-body">
              Description
              <textarea
                className="focus-ring-accent mt-1 min-h-[88px] w-full resize-y rounded-sm border border-border bg-background px-3 py-2 text-body"
                onChange={(event) => onProjectDescriptionChange(event.target.value)}
                rows={3}
                value={projectDescription}
              />
            </label>
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button onClick={() => onOpenChange(false)} type="button" variant="outline">
              Cancel
            </Button>
            <Button className="bg-brand text-brand-foreground hover:bg-brand-hover" disabled={isSaving} type="submit">
              {isSaving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
