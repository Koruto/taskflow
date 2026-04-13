import { Link } from "react-router-dom"

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <p className="text-title font-medium">Page not found</p>
      <Link to="/" className="text-body text-primary underline-offset-4 hover:underline">
        Back home
      </Link>
    </div>
  )
}
