import { TaskflowLogo } from "@/components/brand/taskflow-logo"
import { AppBreadcrumb } from "@/components/layout/app-breadcrumb"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import { LogOut, Moon, Sun } from "lucide-react"

export function AppHeader() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="flex h-14 min-w-0 flex-1 items-center gap-3 bg-white px-4 dark:bg-zinc-950">
      {/* Brand — visible only on mobile (sidebar hidden) */}
      <div className="flex shrink-0 items-center gap-2 md:hidden">
        <TaskflowLogo className="h-6 w-6 shrink-0 text-brand-logo" />
        <span className="text-sm font-bold text-foreground">Taskflow</span>
      </div>

      <div className="hidden min-w-0 flex-1 md:block">
        <AppBreadcrumb />
      </div>

      <div className="flex-1 md:hidden" />

      <div className="flex shrink-0 items-center gap-2">
        <Button
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          className="size-8 shrink-0 rounded-sm"
          onClick={toggleTheme}
          size="icon"
          type="button"
          variant="ghost"
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
        <span className="max-w-40 truncate text-sm font-medium text-foreground">{user?.name ?? "User"}</span>
        <Button
          aria-label="Log out"
          className="size-8 shrink-0 rounded-sm text-muted-foreground"
          onClick={() => logout()}
          size="icon"
          type="button"
          variant="ghost"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  )
}
