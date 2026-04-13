import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"

export function LandingPage() {
  return (
    <div className="flex h-svh flex-col items-center justify-center gap-8 overflow-hidden px-6">
      <div className="flex max-w-md flex-col items-center gap-3 text-center">
        <h1 className="text-heading font-semibold tracking-tight">Taskflow</h1>
        <p className="text-body text-muted-foreground">Projects and tasks, without the noise.</p>
      </div>
      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link to="/login">Log in</Link>
        </Button>
        <Button asChild>
          <Link to="/register">Create account</Link>
        </Button>
      </div>
    </div>
  )
}
