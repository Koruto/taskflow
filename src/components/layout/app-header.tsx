import { useEffect, useState } from "react"
import { Link, useMatch } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import { getProject } from "@/lib/api/taskflow"
import { cn } from "@/lib/utils"
import { LogOut, Moon, Sun } from "lucide-react"

const crumbLinkClass = "text-muted-foreground transition-colors hover:text-foreground"

function useProjectBreadcrumbName(projectId: string | undefined) {
  const [name, setName] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId) {
      setName(null)
      return
    }
    let cancelled = false
    void getProject(projectId)
      .then((project) => {
        if (!cancelled) {
          setName(project.name)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setName(null)
        }
      })
    return () => {
      cancelled = true
    }
  }, [projectId])

  return name
}

export function AppHeader() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const matchDashboard = useMatch({ path: "/dashboard", end: true })
  const matchTasks = useMatch({ path: "/tasks", end: true })
  const matchProjects = useMatch({ path: "/projects", end: true })
  const matchProjectDetail = useMatch("/projects/:projectId")

  const projectId = matchProjectDetail?.params.projectId
  const projectName = useProjectBreadcrumbName(projectId)

  const crumbs = (() => {
    if (matchDashboard) {
      return (
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      )
    }
    if (matchTasks) {
      return (
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>My tasks</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      )
    }
    if (matchProjects) {
      return (
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Projects</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      )
    }
    if (matchProjectDetail && projectId) {
      return (
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link className={cn(crumbLinkClass, "text-sm")} to="/projects">
              Projects
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{projectName ?? "Project"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      )
    }
    return (
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage>Dashboard</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    )
  })()

  return (
    <header className="flex h-14 min-w-0 flex-1 items-center gap-3 bg-white px-4 dark:bg-zinc-950">
      <div className="min-w-0 flex-1">
        <Breadcrumb>{crumbs}</Breadcrumb>
      </div>

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
        <span className="max-w-[10rem] truncate text-sm font-medium text-foreground">{user?.name ?? "User"}</span>
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
