import { Link } from "react-router-dom"

export function RegisterPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <p className="text-title font-medium">Create account</p>
      <p className="text-body text-muted-foreground">Registration form comes in the next phase.</p>
      <Link to="/" className="text-body text-primary underline-offset-4 hover:underline">
        Back home
      </Link>
    </div>
  )
}
