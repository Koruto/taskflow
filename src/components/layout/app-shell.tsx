import { NavLink, Outlet, useNavigate } from "react-router-dom"

import { AppHeader } from "@/components/layout/app-header"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CheckSquare, FolderKanban, LayoutDashboard, Plus } from "lucide-react"

export function AppShell() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-svh w-full flex-col bg-zinc-100 dark:bg-zinc-950">
      <div className="flex shrink-0 border-b border-border bg-white dark:bg-zinc-950">
        <div className="flex h-14 w-64 shrink-0 items-center gap-2 border-r border-border px-4">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-teal-800 text-xs font-bold text-white">
            T
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight text-foreground">Taskflow</p>
            <p className="text-caption leading-tight text-muted-foreground">Workspace</p>
          </div>
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
                    ? "bg-teal-600/10 text-foreground dark:bg-teal-500/15"
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
                    ? "bg-teal-600/10 text-foreground dark:bg-teal-500/15"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )
              }
              end
              to="/tasks"
            >
              <CheckSquare className="size-4 shrink-0 opacity-90" />
              My tasks
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-sm px-2.5 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-teal-600/10 text-foreground dark:bg-teal-500/15"
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
              className="h-8 w-full gap-1.5 rounded-sm bg-teal-700 text-sm text-white hover:bg-teal-800"
              onClick={() => navigate("/projects", { state: { openCreateProject: true } })}
              type="button"
            >
              <Plus className="size-3.5" />
              Add project
            </Button>
          </div>
        </aside>

        <main className="min-h-0 flex-1 overflow-auto bg-zinc-100 p-3 dark:bg-zinc-900/80">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
