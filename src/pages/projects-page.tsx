import { Link } from "react-router-dom"

export function ProjectsPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <p className="text-title font-medium">Projects</p>
      <p className="text-body text-muted-foreground">Project list will load here once auth is wired.</p>
      <Link to="/" className="text-body text-primary underline-offset-4 hover:underline">
        Back home
      </Link>
    </div>
  )
}
