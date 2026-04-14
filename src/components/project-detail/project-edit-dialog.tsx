import { type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { DialogInput, DialogLabel, DialogTextarea } from "@/components/ui/dialog-field"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type ProjectEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectName: string
  onProjectNameChange: (value: string) => void
  projectDescription: string
  onProjectDescriptionChange: (value: string) => void
  isSaving: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  error?: string | null
}

const RequiredMark = () => <span aria-hidden className="ml-0.5 text-destructive">*</span>

export function ProjectEditDialog({
  open,
  onOpenChange,
  projectName,
  onProjectNameChange,
  projectDescription,
  onProjectDescriptionChange,
  isSaving,
  onSubmit,
  error,
}: ProjectEditDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="gap-0 p-0 sm:max-w-lg [&_button]:text-caption">
        <form className="grid" onSubmit={onSubmit}>
          <DialogHeader className="border-b border-border/60 px-4 py-3 pr-12">
            <DialogTitle className="font-heading text-base font-medium leading-none">Edit project</DialogTitle>
            <p className="mt-1 text-caption text-muted-foreground">Update the project name and description.</p>
          </DialogHeader>

          <div className="grid gap-3 px-4 py-3">
            <div className="grid gap-1">
              <DialogLabel htmlFor="edit-project-name">
                Name<RequiredMark />
              </DialogLabel>
              <DialogInput
                id="edit-project-name"
                onChange={(event) => onProjectNameChange(event.target.value)}
                value={projectName}
              />
            </div>
            <div className="grid gap-1">
              <DialogLabel htmlFor="edit-project-desc">Description</DialogLabel>
              <DialogTextarea
                id="edit-project-desc"
                onChange={(event) => onProjectDescriptionChange(event.target.value)}
                value={projectDescription}
              />
            </div>
            {error && (
              <p className="text-caption text-destructive">{error}</p>
            )}
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
