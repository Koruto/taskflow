import { Link } from "react-router-dom"

export function ProjectsPage() {
  return (
    <div className="flex h-full min-h-[calc(100svh-57px)] flex-col items-center justify-center gap-4">
      <p className="text-title font-medium">Projects</p>
      <p className="text-body text-muted-foreground">Project list will load here in the next phase.</p>
      <Link to="/projects/demo" className="text-body text-primary underline-offset-4 hover:underline">
        Open demo project
      </Link>
    </div>
  )
}
