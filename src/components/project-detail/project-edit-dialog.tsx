import { type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { dialogFormControlClass, dialogFormLabelClass } from "@/lib/dialog-form-classes"
import { cn } from "@/lib/utils"

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
      <DialogContent className="gap-0 p-0 sm:max-w-lg [&_button]:text-[0.8rem]">
        <form className="grid" onSubmit={onSubmit}>
          <DialogHeader className="border-b border-border/60 px-4 py-3 pr-12">
            <DialogTitle className="font-heading text-base font-medium leading-none">Edit project</DialogTitle>
            <p className="mt-1 text-[0.8rem] text-muted-foreground">Update the project name and description.</p>
          </DialogHeader>

          <div className="grid gap-3 px-4 py-3">
            <div className="grid gap-1">
              <label className={dialogFormLabelClass} htmlFor="edit-project-name">
                Name
              </label>
              <input
                className={cn(dialogFormControlClass, "h-9 w-full")}
                id="edit-project-name"
                onChange={(event) => onProjectNameChange(event.target.value)}
                value={projectName}
              />
            </div>
            <div className="grid gap-1">
              <label className={dialogFormLabelClass} htmlFor="edit-project-desc">
                Description
              </label>
              <textarea
                className={cn(dialogFormControlClass, "min-h-[72px] w-full resize-y")}
                id="edit-project-desc"
                onChange={(event) => onProjectDescriptionChange(event.target.value)}
                rows={3}
                value={projectDescription}
              />
            </div>
          </div>

          <DialogFooter className="mx-0 mb-0 gap-2 rounded-none border-border/60 bg-muted/30 px-4 py-3 sm:justify-end">
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
