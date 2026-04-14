import { Link } from "react-router-dom"

import { TaskflowLogo } from "@/components/brand/taskflow-logo"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

export function LandingPage() {
  const { isAuthenticated } = useAuth()
  const year = new Date().getFullYear()

  return (
    <div className="tf-marketing-canvas">
      <main className="relative flex min-h-svh w-full flex-col px-6 pt-10 pb-6 sm:px-8">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <Link
            to="/"
            className="mb-5 rounded-sm outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-brand/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:mb-6"
            aria-label="Taskflow home"
          >
            <TaskflowLogo className="h-12 w-12 text-brand-logo sm:h-13 sm:w-13" />
          </Link>

          <h1 className="text-2xl font-semibold tracking-tight sm:whitespace-nowrap sm:text-3xl md:text-4xl md:tracking-tighter">
            Calm planning for real work.
          </h1>
          <p className="mt-2 max-w-sm text-body leading-relaxed text-muted-foreground">
            Projects and tasks, without the noise.
          </p>

          <div className="mt-5 flex w-full max-w-sm flex-col gap-2 sm:mt-6 sm:flex-row sm:justify-center">
            {isAuthenticated ? (
              <Button
                asChild
                size="lg"
                className={cn(
                  "w-full bg-brand text-brand-foreground shadow-none hover:bg-brand-hover sm:w-auto sm:min-w-36",
                  "focus-visible:ring-brand/35"
                )}
              >
                <Link to="/dashboard">Enter app →</Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className={cn(
                    "w-full border-brand/35 bg-card text-brand hover:bg-brand/10 sm:w-auto sm:min-w-36",
                    "dark:border-brand/40 dark:bg-zinc-900/80 dark:hover:bg-brand/15"
                  )}
                >
                  <Link to="/login">Log in</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className={cn(
                    "w-full bg-brand text-brand-foreground shadow-none hover:bg-brand-hover sm:w-auto sm:min-w-36",
                    "focus-visible:ring-brand/35"
                  )}
                >
                  <Link to="/register">Create account</Link>
                </Button>
              </>
            )}
          </div>
        </div>

          <p className="shrink-0 pt-8 text-center text-sm tabular-nums tracking-wide text-muted-foreground">
          Taskflow @ {year}
        </p>
      </main>
    </div>
  )
}
