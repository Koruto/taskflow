import { NavLink, Outlet, useNavigate } from "react-router-dom"

import { TaskflowLogo } from "@/components/brand/taskflow-logo"
import { AppHeader } from "@/components/layout/app-header"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { FolderKanban, LayoutDashboard, Plus } from "lucide-react"

export function AppShell() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-svh w-full flex-col bg-zinc-100 dark:bg-zinc-950">
      <div className="flex shrink-0 border-b border-border bg-white dark:bg-zinc-950">
        <div className="flex h-14 w-64 shrink-0 items-center gap-3 border-r border-border px-4">
          <TaskflowLogo className="h-7 w-7 shrink-0 text-brand-logo" />
          <span className="min-w-0 truncate text-sm font-bold text-foreground">Taskflow</span>
        </div>
        <AppHeader />
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-white dark:bg-zinc-950">
          <nav className="flex flex-1 flex-col gap-0.5 p-2" aria-label="Main">
            <NavLink
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-sm px-2.5 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-sidebar-active text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )
              }
              end
              to="/dashboard"
            >
              <LayoutDashboard className="size-4 shrink-0 opacity-90" />
              Dashboard
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-sm px-2.5 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-sidebar-active text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )
              }
              to="/projects"
            >
              <FolderKanban className="size-4 shrink-0 opacity-90" />
              Projects
            </NavLink>
          </nav>

          <div className="border-t border-border p-2">
            <Button
              className="h-8 w-full gap-1.5 rounded-sm border-brand/35 text-sm text-brand hover:bg-brand/10 dark:border-brand/40 dark:hover:bg-brand/15"
              onClick={() => navigate("/projects", { state: { openCreateProject: true } })}
              type="button"
              variant="outline"
            >
              <Plus className="size-3.5" />
              Add project
            </Button>
          </div>
        </aside>

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-zinc-100 p-3 dark:bg-zinc-900/80">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
