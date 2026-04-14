import { type FormEvent, useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DialogInput, DialogLabel, DialogTextarea } from "@/components/ui/dialog-field"
import { ProjectEditDialog } from "@/components/project-detail/project-edit-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiError } from "@/lib/api/client"
import { createProject, listProjects, updateProject } from "@/lib/api/taskflow"
import { projectAccentStripClass } from "@/lib/project-accent"
import { cn } from "@/lib/utils"
import type { Project } from "@/types"
import { FolderKanban, Pencil, Plus, RefreshCcw } from "lucide-react"

export function ProjectsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  async function loadProjects() {
    setIsLoading(true)
    setLoadError(null)
    try {
      const response = await listProjects()
      setProjects(response.projects)
    } catch (error) {
      setLoadError(error instanceof ApiError ? error.message : "Unable to load projects.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadProjects()
  }, [])

  useEffect(() => {
    const state = location.state as { openCreateProject?: boolean } | null
    if (state?.openCreateProject) {
      setDialogOpen(true)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.pathname, location.state, navigate])

  async function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) {
      setCreateError("Project name is required.")
      return
    }
    setIsCreating(true)
    setCreateError(null)
    try {
      const created = await createProject({ name: name.trim(), description: description.trim() })
      setProjects((current) => [created, ...current])
      setName("")
      setDescription("")
      setDialogOpen(false)
      toast.success("Project created")
    } catch (error) {
      toast.error("Failed to create project", {
        description: error instanceof ApiError ? error.message : "Something went wrong. Please try again.",
      })
    } finally {
      setIsCreating(false)
    }
  }

  function openEditDialog(project: Project) {
    setEditingProject(project)
    setEditName(project.name)
    setEditDescription(project.description ?? "")
    setEditError(null)
  }

  async function handleSaveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editingProject) return
    if (!editName.trim()) {
      setEditError("Project name is required.")
      return
    }
    setIsSaving(true)
    setEditError(null)
    try {
      const updated = await updateProject(editingProject.id, {
        name: editName.trim(),
        description: editDescription.trim(),
      })
      setProjects((current) => current.map((p) => (p.id === updated.id ? updated : p)))
      setEditingProject(null)
      toast.success("Project saved")
    } catch (error) {
      toast.error("Failed to save project", {
        description: error instanceof ApiError ? error.message : "Something went wrong. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto px-1 py-1">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-base font-medium text-foreground">Manage your projects here.</h1>
        </div>
        <Button
          className="gap-2 rounded-sm bg-brand text-brand-foreground hover:bg-brand-hover"
          onClick={() => setDialogOpen(true)}
          type="button"
        >
          <Plus className="size-4" />
          New project
        </Button>
      </div>

      <Dialog
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setCreateError(null)
            setName("")
            setDescription("")
          }
        }}
        open={dialogOpen}
      >
        <DialogContent className="gap-0 p-0 sm:max-w-lg [&_button]:text-caption">
          <form className="grid" onSubmit={handleCreateProject}>
            <DialogHeader className="border-b border-border/60 px-4 py-3 pr-12">
              <DialogTitle className="font-heading text-base font-medium leading-none">Create project</DialogTitle>
              <p className="mt-1 text-caption text-muted-foreground">
                Name your project and add an optional short description.
              </p>
            </DialogHeader>

            <div className="grid gap-3 px-4 py-3">
              <div className="grid gap-1">
                <DialogLabel htmlFor="create-project-name">
                  Name<span aria-hidden className="ml-0.5 text-destructive">*</span>
                </DialogLabel>
                <DialogInput
                  id="create-project-name"
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Website redesign"
                  value={name}
                />
              </div>
              <div className="grid gap-1">
                <DialogLabel htmlFor="create-project-desc">Description</DialogLabel>
                <DialogTextarea
                  id="create-project-desc"
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Optional context for your team"
                  value={description}
                />
              </div>
              {createError && <p className="text-caption text-destructive">{createError}</p>}
            </div>

            <DialogFooter className="mx-0 mb-0 gap-2 rounded-none border-border/60 bg-muted/30 px-4 py-3 sm:justify-end">
              <Button
                onClick={() => setDialogOpen(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                className="bg-brand text-brand-foreground hover:bg-brand-hover"
                disabled={isCreating}
                type="submit"
              >
                {isCreating ? "Creating…" : "Create project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ProjectEditDialog
        error={editError}
        isSaving={isSaving}
        onOpenChange={(open) => {
          if (!open) {
            setEditingProject(null)
            setEditError(null)
          }
        }}
        onProjectDescriptionChange={setEditDescription}
        onProjectNameChange={setEditName}
        onSubmit={handleSaveEdit}
        open={editingProject !== null}
        projectDescription={editDescription}
        projectName={editName}
      />

      {isLoading && (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <li className="min-h-0" key={i}>
              <div className="flex min-h-30 overflow-hidden rounded-sm border border-page-panel-border bg-page-panel shadow-sm">
                <Skeleton className="w-0.5 rounded-none sm:w-[3px]" />
                <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!isLoading && loadError && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-page-panel-border bg-muted/30 px-6 py-14 text-center">
          <p className="text-sm text-destructive">{loadError}</p>
          <Button
            className="gap-2 rounded-sm"
            onClick={() => void loadProjects()}
            size="sm"
            type="button"
            variant="outline"
          >
            <RefreshCcw className="size-3.5" />
            Try again
          </Button>
        </div>
      )}

      {!isLoading && !loadError && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-page-panel-border bg-muted/30 px-6 py-14 text-center">
          <FolderKanban className="size-10 text-muted-foreground" />
          <div>
            <p className="text-body font-medium">No projects yet</p>
            <p className="mt-1 text-caption text-muted-foreground">Create your first project to get started.</p>
          </div>
          <Button
            className="gap-2 rounded-sm bg-brand text-brand-foreground hover:bg-brand-hover"
            onClick={() => setDialogOpen(true)}
            type="button"
          >
            <Plus className="size-4" />
            New project
          </Button>
        </div>
      )}

      {!isLoading && !loadError && projects.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <li className="min-h-0" key={project.id}>
              <div
                className={cn(
                  "group flex h-full min-h-30 overflow-hidden rounded-sm border border-page-panel-border bg-page-panel shadow-sm",
                  "transition-[box-shadow,transform,border-color] duration-200",
                  "hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md dark:border-border"
                )}
              >
                <div
                  aria-hidden
                  className={cn("w-0.5 shrink-0 sm:w-[3px]", projectAccentStripClass(project.id))}
                />
                <Link
                  className="flex min-h-30 min-w-0 flex-1 flex-col p-4 pr-2 transition-colors hover:bg-transparent"
                  to={`/projects/${project.id}`}
                >
                  <p className="text-base font-semibold leading-snug text-foreground">
                    {project.name.trim() ? project.name : "Untitled project"}
                  </p>
                  {project.description != null && project.description.trim() !== "" ? (
                    <p className="mt-1 flex-1 text-sm leading-snug text-muted-foreground line-clamp-4">
                      {project.description.trim()}
                    </p>
                  ) : (
                    <p className="mt-1 flex-1 text-sm leading-snug text-muted-foreground/90">No description</p>
                  )}
                </Link>
                <div className="relative z-10 flex shrink-0 flex-col p-2 pl-1">
                  <Button
                    aria-label={`Edit ${project.name.trim() ? project.name : "project"}`}
                    className="size-8 shrink-0 text-muted-foreground opacity-0 transition-opacity hover:bg-muted/80 hover:text-foreground group-hover:opacity-100"
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      openEditDialog(project)
                    }}
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
