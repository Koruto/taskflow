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
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-1 py-1">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Projects</h1>
          <p className="mt-1 text-body text-muted-foreground">
            Organize work into projects. Open one to manage tasks on a board.
          </p>
        </div>
        <Button
          className="gap-2 rounded-sm bg-teal-700 text-white hover:bg-teal-800"
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
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-body outline-none ring-ring/40 focus-visible:ring-2"
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Website redesign"
                  value={name}
                />
              </label>
              <label className="text-body">
                Description
                <textarea
                  className="mt-1 min-h-[88px] w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-body outline-none ring-ring/40 focus-visible:ring-2"
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
              <Button disabled={isCreating} type="submit">
                {isCreating ? "Creating…" : "Create project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {errorMessage && !dialogOpen && <p className="text-caption text-destructive">{errorMessage}</p>}
      {isLoading && <p className="text-body text-muted-foreground">Loading projects…</p>}
      {!isLoading && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-sm border border-dashed bg-muted/30 px-6 py-14 text-center">
          <FolderKanban className="size-10 text-muted-foreground" />
          <div>
            <p className="text-body font-medium">No projects yet</p>
            <p className="mt-1 text-caption text-muted-foreground">Create your first project to get started.</p>
          </div>
          <Button
            className="gap-2 rounded-sm bg-teal-700 text-white hover:bg-teal-800"
            onClick={() => setDialogOpen(true)}
            type="button"
          >
            <Plus className="size-4" />
            New project
          </Button>
        </div>
      )}

      {projects.length > 0 && (
        <ul className="grid gap-3">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                className={cn(
                  "block rounded-sm border bg-card p-4 shadow-sm transition-colors",
                  "hover:border-primary/30 hover:bg-muted/40"
                )}
                to={`/projects/${project.id}`}
              >
                <p className="text-body font-medium">{project.name}</p>
                {project.description ? (
                  <p className="mt-1 text-caption text-muted-foreground line-clamp-2">{project.description}</p>
                ) : (
                  <p className="mt-1 text-caption text-muted-foreground">No description</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
