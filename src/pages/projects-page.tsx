import { type FormEvent, useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ApiError } from "@/lib/api/client"
import { createProject, listProjects } from "@/lib/api/taskflow"
import { cn } from "@/lib/utils"
import type { Project } from "@/types"
import { FolderKanban, Plus } from "lucide-react"

export function ProjectsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  async function loadProjects() {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const response = await listProjects()
      setProjects(response.projects)
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Unable to load projects.")
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
      setErrorMessage("Project name is required.")
      return
    }
    setIsCreating(true)
    setErrorMessage(null)
    try {
      const created = await createProject({ name: name.trim(), description: description.trim() })
      setProjects((current) => [created, ...current])
      setName("")
      setDescription("")
      setDialogOpen(false)
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Unable to create project.")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 px-1 py-1">
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
            setErrorMessage(null)
          }
        }}
        open={dialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <form className="grid gap-4" onSubmit={handleCreateProject}>
            <DialogHeader>
              <DialogTitle>Create project</DialogTitle>
              <DialogDescription>Name your project and add an optional short description.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <label className="text-body">
                Name
                <input
                  autoFocus
                  className="focus-ring-accent mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-body"
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Website redesign"
                  value={name}
                />
              </label>
              <label className="text-body">
                Description
                <textarea
                  className="focus-ring-accent mt-1 min-h-[88px] w-full resize-y rounded-sm border border-border bg-background px-3 py-2 text-body"
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Optional context for your team"
                  rows={3}
                  value={description}
                />
              </label>
              {errorMessage && <p className="text-caption text-destructive">{errorMessage}</p>}
            </div>
            <DialogFooter className="gap-2 sm:justify-end">
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

      {errorMessage && !dialogOpen && <p className="text-caption text-destructive">{errorMessage}</p>}
      {isLoading && <p className="text-body text-muted-foreground">Loading projects…</p>}
      {!isLoading && projects.length === 0 && (
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

      {projects.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <li className="min-h-0" key={project.id}>
              <Link
                className={cn(
                  "flex h-full min-h-[7.5rem] flex-col rounded-sm border border-page-panel-border bg-page-panel p-4 transition-colors",
                  "hover:border-accent/35 hover:bg-muted/30"
                )}
                to={`/projects/${project.id}`}
              >
                <p className="text-base font-medium text-foreground">
                  {project.name.trim() ? project.name : "Untitled project"}
                </p>
                {project.description != null && project.description.trim() !== "" ? (
                  <p className="mt-1 flex-1 text-sm text-muted-foreground line-clamp-4">{project.description.trim()}</p>
                ) : (
                  <p className="mt-1 flex-1 text-sm text-muted-foreground">No description</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
