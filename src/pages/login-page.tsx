import { Link } from "react-router-dom"

export function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <p className="text-title font-medium">Log in</p>
      <p className="text-body text-muted-foreground">Form and auth flow come in the next phase.</p>
      <Link to="/" className="text-body text-primary underline-offset-4 hover:underline">
        Back home
      </Link>
    </div>
  )
}
