import { Link, useParams } from "react-router-dom"

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <p className="text-title font-medium">Project</p>
      <p className="text-caption font-mono text-muted-foreground">{projectId ?? "—"}</p>
      <Link to="/projects" className="text-body text-primary underline-offset-4 hover:underline">
        All projects
      </Link>
    </div>
  )
}
